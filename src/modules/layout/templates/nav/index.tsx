import { Suspense } from "react"
import { listRegions } from "@lib/data/regions"
import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import HeaderCountrySelect from "@modules/layout/components/header-country-select"
import HeaderLanguageSelect from "@modules/layout/components/header-language-select"
import { User, ShoppingBag } from "@medusajs/icons"

// 获取当前locale的函数
async function getCurrentLocale() {
  try {
    const locale = await getLocale()
    return locale || 'en'
  } catch (error) {
    return 'en'
  }
}

// 获取品牌数据
async function getBrandData() {
  try {
    const locale = await getCurrentLocale()
    const res = await fetch(
        process.env.NEXT_PUBLIC_STRAPI_API_URL + `/api/lila-header?locale=${locale}&populate=*`,
        {
          next: { revalidate: 3600 }
        }
    )

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    const data = await res.json()
    return data.data
  } catch (error) {
    console.error('获取品牌信息失败:', error)
    return null
  }
}

// 获取导航菜单数据
async function getMenuData() {
  try {
    const locale = await getCurrentLocale()
    const res = await fetch(
        process.env.NEXT_PUBLIC_STRAPI_API_URL + `/api/lila-menuitems?locale=${locale}&populate=*`,
        {
          next: { revalidate: 3600 }
        }
    )

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    const data = await res.json()
    return data.data || []
  } catch (error) {
    console.error('获取菜单信息失败:', error)
    return []
  }
}

// 构建菜单树形结构
function buildMenuTree(items: any[]) {
  // 1. 过滤 visible: true 的项
  const visibleItems = items.filter(item => item.visible === true)

  // 2. 找出顶级菜单项 (parent === null)
  const topLevelItems = visibleItems.filter(item => !item.parent)

  // 3. 按 order 排序
  topLevelItems.sort((a, b) => a.order - b.order)

  // 4. 为每个顶级菜单添加子菜单
  return topLevelItems.map(item => ({
    ...item,
    children: visibleItems
        .filter(child => child.parent?.id === item.id)
        .sort((a, b) => a.order - b.order)
  }))
}

export default async function Nav() {
  // 并行获取所有数据
  const [regions, locales, currentLocale, brandData, menuData] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    listLocales(),
    getLocale(),
    getBrandData(),
    getMenuData(),
  ])

  // 构建树形菜单
  const menuTree = buildMenuTree(menuData)

  return (
      <div className="sticky top-0 inset-x-0 z-50">
        <header className="relative h-16 mx-auto border-b duration-200 bg-white border-ui-border-base">
          <nav className="content-container txt-xsmall-plus text-ui-fg-subtle flex items-center justify-between w-full h-full text-small-regular">

            <div className="flex-1 basis-0 h-full flex items-center">
              <div className="ml-4">
                <LocalizedClientLink href="/" className="flex items-center gap-x-2">
                  {brandData?.logo?.url ? (
                      <img
                          src={`http://47.89.151.64:1337${brandData.logo.url}`}
                          alt={brandData.sitename || 'Logo'}
                          className="h-8 w-auto"
                      />
                  ) : (
                      <div className="h-8 w-8 bg-gray-100 rounded flex items-center justify-center">
                        <span className="text-sm font-bold text-gray-600">LZ</span>
                      </div>
                  )}
                  <span className="hidden md:inline txt-compact-large-plus font-semibold text-ui-fg-base">
                  {brandData?.sitename || 'LILA ZEN'}
                </span>
                </LocalizedClientLink>
              </div>
            </div>

            <div className="hidden lg:flex items-center justify-center flex-1">
              <DesktopNavigation menuData={menuTree} />
            </div>

            <div className="lg:hidden flex items-center h-full">
              <LocalizedClientLink
                  href="/"
                  className="txt-compact-xlarge-plus hover:text-ui-fg-base uppercase"
                  data-testid="nav-store-link"
              >
                Medusa Store
              </LocalizedClientLink>
            </div>

            <div className="flex items-center gap-x-6 h-full flex-1 basis-0 justify-end">
              {/* 国家和语言选择器 */}
              <div className="hidden sm:flex items-center gap-x-4 mr-4">
                {regions && <HeaderCountrySelect regions={regions} />}
                {locales && (
                    <div className="h-6 w-px bg-ui-border-base" />
                )}
                {locales && (
                    <HeaderLanguageSelect
                        locales={locales}
                        currentLocale={currentLocale}
                    />
                )}
              </div>

              {/* 图标导航 */}
              <div className="hidden small:flex items-center gap-x-6 h-full">
                <LocalizedClientLink
                    className="hover:text-ui-fg-base flex items-center justify-center w-8 h-8 rounded-md hover:bg-ui-bg-subtle-hover transition-colors"
                    href="/account"
                    data-testid="nav-account-link"
                    title="Account"
                >
                  <User className="h-5 w-5" />
                </LocalizedClientLink>
              </div>

              <Suspense
                  fallback={
                    <LocalizedClientLink
                        className="hover:text-ui-fg-base flex items-center justify-center w-8 h-8 rounded-md hover:bg-ui-bg-subtle-hover transition-colors"
                        href="/cart"
                        data-testid="nav-cart-link"
                        title="Cart"
                    >
                      <ShoppingBag className="h-5 w-5" />
                    </LocalizedClientLink>
                  }
              >
                <CartButton />
              </Suspense>
            </div>
          </nav>
        </header>
      </div>
  )
}

// 桌面端导航组件
function DesktopNavigation({ menuData }: { menuData: any[] }) {
  return (
      <nav className="flex items-center space-x-8">
        {menuData.map((item) => (
            <MenuItem key={item.id} item={item} />
        ))}
      </nav>
  )
}

function MenuItem({ item }: { item: any }) {
  return (
      <div className="relative group"> {/* 将 group 放在最外层 div */}
        <LocalizedClientLink
            href={`/${item.url}`}
            className="text-ui-fg-subtle hover:text-ui-fg-base transition-colors py-4 px-1 font-medium inline-block"
        >
          {item.title}
        </LocalizedClientLink>

        {item.children && item.children.length > 0 && (
            <div className="absolute top-full left-0 w-48 bg-white border border-ui-border-base rounded-md shadow-lg opacity-0 invisible pointer-events-none group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto transition-all duration-200 z-10">
              <div className="py-2">
                {item.children.map((child: any) => (
                    <LocalizedClientLink
                        key={child.id}
                        href={`/${child.url}`}
                        className="block px-4 py-2 text-sm text-ui-fg-subtle hover:text-ui-fg-base hover:bg-ui-bg-subtle-hover"
                    >
                      {child.title}
                    </LocalizedClientLink>
                ))}
              </div>
            </div>
        )}
      </div>
  )
}