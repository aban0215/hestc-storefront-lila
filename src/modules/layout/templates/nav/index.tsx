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
import NavLinks from "@modules/layout/templates/nav/NavLinks";
// 引入你刚创建的移动端组件
import MobileMenu from "@modules/layout/templates/nav/mobile-menu";

async function getCurrentLocale() {
  try {
    const locale = await getLocale()
    return locale || 'en-US'
  } catch (error) { return 'en-US' }
}

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
      <div className="sticky top-0 inset-x-0 z-[999]">
        <header className="relative bg-white backdrop-blur-md border-b border-gray-100 shadow-sm">
          <nav className="content-container mx-auto relative px-4 lg:px-0">

            {/* 第一行：功能区 + Sitename */}
            <div className="flex justify-between items-center h-[60px]">

              {/* 左侧：PC端是占位，手机端是汉堡菜单 */}
              <div className="flex-1 lg:w-48 lg:flex-none">
                <div className="lg:hidden">
                  <MobileMenu menuTree={menuTree} brandData={brandData} />
                </div>
                <div className="hidden lg:block w-48" />
              </div>

              {/* 中间：Sitename (手机端缩小字体以适配) */}
              <div className="flex-[2] lg:flex-1 text-center">
                <LocalizedClientLink href="/" className="text-[20px] md:text-[24px] lg:text-[30px] font-semibold tracking-[0.2em] lg:tracking-[0.4em] uppercase text-gray-900 hover:text-pink-600 transition-colors whitespace-nowrap">
                  {brandData?.sitename || "LILA ZEN"}
                </LocalizedClientLink>
              </div>

              {/* 右侧：功能按钮组 */}
              <div className="flex-1 lg:w-48 lg:flex-none flex justify-end items-center gap-x-4 lg:gap-x-6">

                {/* 1. 国家/语言选择器 - 仅在 PC 端显示 */}
                <div className="hidden lg:block relative group flex items-center whitespace-nowrap">
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

                {/* 2. 用户图标 - 手机端也保留，或可根据需求隐藏 */}
                <LocalizedClientLink href="/account" className="text-gray-700 hover:text-pink-600 flex items-center">
                  <User size={20} strokeWidth={1.5} />
                </LocalizedClientLink>

                {/* 3. 购物车图标 */}
                <Suspense fallback={<ShoppingBag size={20} />}>
                  <div className="flex items-center translate-y-[2.5px]">
                    <CartButton />
                  </div>
                </Suspense>
              </div>
            </div>

            {/* 第二行：主菜单栏 - 仅在 PC 端 (lg以上) 显示 */}
            <div className="hidden lg:block relative">
              {/* 跨行大 Logo */}
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