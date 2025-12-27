import { Suspense } from "react"
import { listRegions } from "@lib/data/regions"
import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import HeaderCountrySelect from "@modules/layout/components/header-country-select"
import HeaderLanguageSelect from "@modules/layout/components/header-language-select"
import { User, ShoppingBag } from "@medusajs/icons"
import ActiveRegion from "@modules/layout/templates/nav/active-region";
import NavContainer from "@modules/layout/templates/nav/nav-container";
import NavLinks from "@modules/layout/templates/nav/NavLinks";


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
  const currentLocale = await getCurrentLocale()
  const [regions, locales, brandData, menuData] = await Promise.all([
    listRegions(),
    listLocales(),
    getBrandData(currentLocale),
    getMenuData(currentLocale),
  ])

  const menuTree = buildMenuTree(menuData)
  const baseUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://47.89.151.64:1337"
  const logoUrl = brandData?.logo?.url ? `${brandData.logo.url.startsWith('http') ? '' : baseUrl}${brandData.logo.url}` : null

  return (
      // 移除滚动位移逻辑，保持 sticky 即可
      <div className="sticky top-0 inset-x-0 z-[999]">
        <header className="relative bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
          <nav className="content-container mx-auto relative">

            {/* 第一行：功能区 + Sitename (放大) */}
            <div className="flex justify-between items-center h-[60px]">
              {/* 左侧占位 */}
              <div className="w-48 flex-shrink-0" />

              {/* 中间：Sitename (字体放大 50%) */}
              <div className="flex-1 text-center">
                <LocalizedClientLink href="/" className="text-[30px] font-semibold tracking-[0.4em] uppercase text-gray-900 hover:text-pink-600 transition-colors">
                  {brandData?.sitename || "LILA ZEN"}
                </LocalizedClientLink>
              </div>

              {/* 右侧：功能按钮组 */}
              <div className="w-48 flex justify-end items-center gap-x-6">
                {/* 1. 国家/语言选择器 - 强制不换行 */}
                <div className="relative group flex items-center whitespace-nowrap">
                  <button className="text-gray-700 hover:text-pink-600 transition-all flex items-center gap-x-1">
                    <ActiveRegion />
                  </button>
                  <div className="absolute top-full right-0 pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[110]">
                    <div className="w-48 bg-white border shadow-xl rounded-xl p-4">
                      <HeaderCountrySelect regions={regions} />
                      <div className="mt-4 pt-4 border-t border-gray-50">
                        <HeaderLanguageSelect locales={locales} currentLocale={currentLocale} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. 用户图标 */}
                <LocalizedClientLink href="/account" className="text-gray-700 hover:text-pink-600 flex items-center">
                  <User size={20} strokeWidth={1.5} />
                </LocalizedClientLink>

                {/* 3. 购物车图标 - 视觉对齐修正 */}
                <Suspense fallback={<ShoppingBag size={20} />}>
                  <div className="flex items-center translate-y-[2.5px]">
                    <CartButton />
                  </div>
                </Suspense>
              </div>
            </div>

            {/* 第二行：主菜单栏 */}
            <div className="relative">
              {/* 跨行大 Logo 保持在这里，因为它需要相对父级定位 */}
              <div className="absolute left-0 -top-[60px] z-[130] pointer-events-auto">
                <LocalizedClientLink href="/" className="active:scale-95 transition-transform block">
                  {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="h-24 w-auto object-contain drop-shadow-[0_2px_12px_rgba(0,0,0,0.06)]" />
                  ) : (
                      <div className="h-20 w-20 bg-black text-white flex items-center justify-center font-bold text-2xl">LZ</div>
                  )}
                </LocalizedClientLink>
              </div>

              {/* 渲染抽离出的菜单组件 */}
              <NavLinks menuTree={menuTree} />
            </div>

          </nav>
        </header>
      </div>
  )
}