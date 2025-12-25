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
import { Search } from "lucide-react"

// --- 数据获取函数保持不变 ---
async function getCurrentLocale() {
  try {
    const locale = await getLocale()
    return locale || 'en'
  } catch (error) {
    return 'en'
  }
}

async function getBrandData() {
  try {
    const locale = await getCurrentLocale()
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/lila-header?locale=${locale}&populate=*`,
        { next: { revalidate: 3600 } }
    )
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    const data = await res.json()
    return data.data
  } catch (error) {
    console.error('获取品牌信息失败:', error)
    return null
  }
}

async function getMenuData() {
  try {
    const locale = await getCurrentLocale()
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/lila-menuitems?locale=${locale}&populate=*`,
        { next: { revalidate: 3600 } }
    )
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    const data = await res.json()
    return data.data || []
  } catch (error) {
    console.error('获取菜单信息失败:', error)
    return []
  }
}

function buildMenuTree(items: any[]) {
  const visibleItems = items.filter(item => item.visible === true)
  const topLevelItems = visibleItems.filter(item => !item.parent)
  topLevelItems.sort((a, b) => a.order - b.order)

  return topLevelItems.map(item => ({
    ...item,
    children: visibleItems
        .filter(child => child.parent?.id === item.id)
        .sort((a, b) => a.order - b.order)
  }))
}

// --- 主组件 ---
export default async function Nav() {
  const [regions, locales, currentLocale, brandData, menuData] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    listLocales(),
    getLocale(),
    getBrandData(),
    getMenuData(),
  ])

  const menuTree = buildMenuTree(menuData)

  return (
      <div className="sticky top-0 inset-x-0 z-50">
        <header className="relative h-24 mx-auto border-b duration-200 bg-white border-ui-border-base">
          <nav className="content-container flex items-center justify-between w-full h-full py-4">

            <div className="flex items-center space-x-24">

              <div className="flex items-center">
                <LocalizedClientLink href="/" className="flex items-center">
                  {brandData?.logo?.url ? (
                      <img
                          src={`${brandData.logo.url}`}
                          alt={brandData.sitename || 'Logo'}
                          className="h-20 w-auto"
                      />
                  ) : (
                      <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center">
                        <span className="text-sm font-bold text-gray-600">LZ</span>
                      </div>
                  )}
                </LocalizedClientLink>
              </div>

              <div className="hidden lg:flex items-center space-x-6">
                {menuTree.map((item) => (
                    <div key={item.id} className="relative group">
                      <LocalizedClientLink
                          href={`/${item.url}`}
                          className="text-ui-fg-base hover:text-ui-fg-subtle transition-colors font-medium text-[13px] tracking-[0.1em] uppercase leading-none"
                      >
                        {item.title}
                      </LocalizedClientLink>

                      {/* 下拉菜单：微调 vertical margin，避免与主菜单挤在一起 */}
                      {item.children && item.children.length > 0 && (
                          <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-ui-border-base shadow-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                            <div className="py-2">
                              {item.children.map((child: any) => (
                                  <LocalizedClientLink
                                      key={child.id}
                                      href={`/${child.url}`}
                                      className="block px-4 py-2 text-[12px] tracking-wider uppercase text-ui-fg-subtle hover:text-ui-fg-base hover:bg-ui-bg-subtle-hover"
                                  >
                                    {child.title}
                                  </LocalizedClientLink>
                              ))}
                            </div>
                          </div>
                      )}
                    </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-x-4">
              <div className="hidden sm:flex items-center gap-x-4 mr-4">
                {regions && <HeaderCountrySelect regions={regions} />}
                {locales && <div className="h-6 w-px bg-ui-border-base" />}
                {locales && (
                    <HeaderLanguageSelect
                        locales={locales}
                        currentLocale={currentLocale}
                    />
                )}
              </div>

              {/* ✅ 用户图标：用 flex-center 包裹，确保居中 */}
              <LocalizedClientLink
                  className="flex items-center justify-center hover:opacity-60 transition-opacity"
                  href="/account"
              >
                <User className="h-5 w-5" strokeWidth={1.5} />
              </LocalizedClientLink>

              <Suspense
                  fallback={
                    <LocalizedClientLink
                        className="flex items-center justify-center hover:opacity-60 transition-opacity"
                        href="/cart"
                    >
                      <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
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