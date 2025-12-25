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
import ActiveRegion from "@modules/layout/templates/nav/active-region";
// --- 工具函数 ---
const getMenuHref = (linkType: string, slug: string) => {
  if (!slug) return "/"
  const cleanSlug = slug.trim().toLowerCase().replace(/\s+/g, "-").replace(/^\//, "")
  switch (linkType) {
    case "category": return `/categories/${cleanSlug}`
    case "collection": return `/collections/${cleanSlug}`
    case "blog": return `/blog`
    default: return `/${cleanSlug}`
  }
}

async function getCurrentLocale() {
  try {
    const locale = await getLocale()
    return locale || 'en-US'
  } catch (error) { return 'en-US' }
}

// 核心优化：增加 cache: 'no-store' 确保数据实时性
async function getBrandData(locale: string) {
  try {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/lila-header?locale=${locale}&populate=*`,
        { cache: 'no-store' }
    )
    const data = await res.json()
    return data.data
  } catch (error) { return null }
}

async function getMenuData(locale: string) {
  try {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/lila-menuitems?locale=${locale}&populate=*&sort=order:asc`,
        { cache: 'no-store' }
    )
    const data = await res.json()
    return data.data || []
  } catch (error) { return [] }
}

function buildMenuTree(items: any[]) {
  const visibleItems = items.filter(item => item.visible === true)
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
  // 1. 获取当前 Locale。在切换后，这个值会反映最新的 URL 路径
  const currentLocale = await getCurrentLocale()

  const [regions, locales, brandData, menuData] = await Promise.all([
    listRegions(),
    listLocales(),
    getBrandData(currentLocale),
    getMenuData(currentLocale),
  ])

  const menuTree = buildMenuTree(menuData)
  const baseUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://47.89.151.64:1337"

  // 2. 动态解析显示文字。如果 currentLocale 是 "us" 或 "en-us"
  // 直接通过 locale 解析是最稳妥的，因为它直接反映了当前的上下文
  const localeParts = currentLocale.toUpperCase().split('-')
  const displayLang = localeParts[0]
  const displayCountry = localeParts[1] || localeParts[0]

  return (
      <div className="sticky top-0 inset-x-0 z-50">
        <header className="relative h-20 mx-auto border-b duration-300 bg-white/80 backdrop-blur-md border-gray-100 group/nav">
          <nav className="content-container flex items-center justify-between w-full h-full">

            <div className="flex items-center h-full gap-x-36">
              {/* Logo */}
              <div className="flex items-center">
                <LocalizedClientLink href="/" className="flex items-center transition-transform duration-300 active:scale-95">
                  {brandData?.logo?.url ? (
                      <img
                          src={`${brandData.logo.url.startsWith('http') ? '' : baseUrl}${brandData.logo.url}`}
                          alt={brandData.sitename || 'Logo'}
                          className="h-14 w-auto object-contain"
                      />
                  ) : (
                      <div className="h-10 px-3 bg-black rounded flex items-center justify-center font-bold text-white tracking-widest uppercase">LZ</div>
                  )}
                </LocalizedClientLink>
              </div>

              {/* 菜单 */}
              <div className="hidden lg:flex items-center h-full">
                {menuTree.map((item) => (
                    <div key={item.id} className="relative group h-full flex items-center px-4 text-[12px] tracking-[0.15em] font-semibold uppercase">
                      <LocalizedClientLink
                          href={getMenuHref(item.link_type, item.slug)}
                          className="relative py-2 text-ui-fg-base transition-all"
                      >
                        {item.title}
                        <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-pink-600 transition-all duration-300 group-hover:w-full" />
                      </LocalizedClientLink>

                      {item.children && item.children.length > 0 && (
                          <div className="absolute top-full left-0 pt-2 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 ease-out z-50">
                            <div className="w-56 bg-white border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.08)] py-3 rounded-sm">
                              {item.children.map((child: any) => (
                                  <LocalizedClientLink
                                      key={child.id}
                                      href={getMenuHref(child.link_type, child.slug)}
                                      className="block px-6 py-2.5 text-[10px] tracking-[0.12em] text-gray-500 hover:text-pink-600 hover:bg-pink-50/30 transition-all"
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

            {/* 右侧工具栏 */}
            <div className="flex items-center gap-x-6">
              <div className="hidden sm:flex items-center h-full">
                <div className="relative group h-full flex items-center">
                  {/* 动态显示的按钮 */}
                  <button className="p-2 hover:bg-gray-50 rounded-full transition-all text-gray-700 hover:text-pink-600 flex items-center gap-x-2">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18" height="18"
                        viewBox="0 0 24 24"
                        fill="none" stroke="currentColor"
                        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                    </svg>
                    <ActiveRegion />
                  </button>

                  {/* 悬停弹窗 */}
                  <div className="absolute top-full right-0 pt-2 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 ease-out z-[60]">
                    <div className="w-64 bg-white border border-gray-100 shadow-[0_15px_50px_rgba(0,0,0,0.15)] rounded-xl p-6">
                      <div className="flex flex-col gap-y-6 text-left">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-3 border-b border-gray-50 pb-2">Shipping To</p>
                          <div className="px-1">
                            {regions && <HeaderCountrySelect regions={regions} />}
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-3 border-b border-gray-50 pb-2">Language</p>
                          <div className="px-1 text-black font-medium">
                            {locales && (
                                <HeaderLanguageSelect
                                    locales={locales}
                                    currentLocale={currentLocale}
                                />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 用户及购物车 */}
              <div className="flex items-center gap-x-4">
                <LocalizedClientLink
                    className="p-2 hover:bg-gray-50 rounded-full transition-all text-gray-700 hover:text-pink-600"
                    href="/account"
                >
                  <User size={20} strokeWidth={1} />
                </LocalizedClientLink>

                <Suspense fallback={<ShoppingBag size={20} strokeWidth={1} />}>
                  <div className="p-2 hover:bg-gray-50 rounded-full transition-all text-gray-700 hover:text-pink-600">
                    <CartButton />
                  </div>
                </Suspense>
              </div>
            </div>
          </nav>
        </header>
      </div>
  )
}