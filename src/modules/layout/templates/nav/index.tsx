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

// --- 路由解析器：根据 link_type 生成正确的路径 ---
const getMenuHref = (linkType: string, slug: string) => {
  if (!slug) return "/"

  // 处理 slug：去除首尾空格，将内部空格替换为连字符
  const cleanSlug = slug.trim().toLowerCase().replace(/\s+/g, "-").replace(/^\//, "")

  switch (linkType) {
    case "category":
      return `/categories/${cleanSlug}`
    case "collection":
      return `/collections/${cleanSlug}`
    case "blog":
      return `/blog` // 假设 blog 跳转到列表页
    default:
      return `/${cleanSlug}`
  }
}

// --- 数据获取函数 ---
async function getCurrentLocale() {
  try {
    const locale = await getLocale()
    return locale || 'en-US'
  } catch (error) {
    return 'en-US'
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
    // 增加排序参数确保 order 生效
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/lila-menuitems?locale=${locale}&populate=*&sort=order:asc`,
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
  // 1. 只获取可见项
  const visibleItems = items.filter(item => item.visible === true)

  // 2. 找到顶级菜单 (没有 parent，或者 parent 字段为空)
  // Strapi 5 的关系数据在 item.parent 中
  const topLevelItems = visibleItems.filter(item => !item.parent)

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
  const baseUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://47.89.151.64:1337"

  return (
      <div className="sticky top-0 inset-x-0 z-50">
        <header className="relative h-24 mx-auto border-b duration-200 bg-white border-ui-border-base">
          <nav className="content-container flex items-center justify-between w-full h-full py-4">

            <div className="flex items-center space-x-24">
              {/* Logo 区域 */}
              <div className="flex items-center">
                <LocalizedClientLink href="/" className="flex items-center">
                  {brandData?.logo?.url ? (
                      <img
                          src={`${brandData.logo.url.startsWith('http') ? '' : baseUrl}${brandData.logo.url}`}
                          alt={brandData.sitename || 'Logo'}
                          className="h-20 w-auto object-contain"
                      />
                  ) : (
                      <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center">
                        <span className="text-sm font-bold text-gray-600">LZ</span>
                      </div>
                  )}
                </LocalizedClientLink>
              </div>

              {/* 动态菜单区域 */}
              <div className="hidden lg:flex items-center space-x-8 h-full">
                {menuTree.map((item) => (
                    <div key={item.id} className="relative group h-full flex items-center">
                      <LocalizedClientLink
                          href={getMenuHref(item.link_type, item.slug)}
                          className="text-ui-fg-base hover:text-pink-600 transition-colors font-medium text-[13px] tracking-[0.1em] uppercase leading-none"
                      >
                        {item.title}
                      </LocalizedClientLink>

                      {/* 下拉菜单渲染 */}
                      {item.children && item.children.length > 0 && (
                          <>
                            {/* 增加一个透明遮罩桥接，防止鼠标滑向下拉框时中断 */}
                            <div className="absolute top-full left-0 w-full h-2 invisible group-hover:visible" />

                            <div className="absolute top-[calc(100%-20px)] left-0 mt-5 w-48 bg-white border border-ui-border-base shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                              <div className="py-2">
                                {item.children.map((child: any) => (
                                    <LocalizedClientLink
                                        key={child.id}
                                        href={getMenuHref(child.link_type, child.slug)}
                                        className="block px-5 py-3 text-[11px] tracking-widest uppercase text-ui-fg-subtle hover:text-pink-600 hover:bg-gray-50 transition-all border-b last:border-b-0 border-gray-50"
                                    >
                                      {child.title}
                                    </LocalizedClientLink>
                                ))}
                              </div>
                            </div>
                          </>
                      )}
                    </div>
                ))}
              </div>
            </div>

            {/* 右侧工具栏 */}
            <div className="flex items-center gap-x-5">
              <div className="hidden sm:flex items-center gap-x-4 mr-2">
                {regions && <HeaderCountrySelect regions={regions} />}
                {locales && <div className="h-4 w-px bg-ui-border-base" />}
                {locales && (
                    <HeaderLanguageSelect
                        locales={locales}
                        currentLocale={currentLocale}
                    />
                )}
              </div>

              <LocalizedClientLink
                  className="flex items-center justify-center hover:text-pink-600 transition-colors"
                  href="/account"
              >
                <User className="h-5 w-5" strokeWidth={1.5} />
              </LocalizedClientLink>

              <Suspense
                  fallback={
                    <LocalizedClientLink
                        className="flex items-center justify-center hover:text-pink-600 transition-colors"
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