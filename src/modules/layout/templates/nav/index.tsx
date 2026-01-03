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
      <div className="sticky top-0 inset-x-0 z-[100] w-full">
        <header className="relative bg-white/90 backdrop-blur-md border-b border-gray-100">
          <nav className="content-container mx-auto px-4 lg:px-0">
            <div className="flex justify-between items-center h-[60px]">

              {/* 左侧：保持与右侧等宽 (lg:w-48)，实现中间真正居中 */}
              <div className="flex-1 lg:w-48 lg:flex-none flex items-center">
                <div className="lg:hidden">
                  <MobileMenu
                      menuTree={menuTree}
                      brandData={brandData}
                      regions={regions}
                      locales={locales}
                      currentLocale={currentLocale}
                  />
                </div>
              </div>

              {/* 中间：Sitename 居中 */}
              <div className="flex-[2] lg:flex-1 text-center flex items-center justify-center h-full">
                <LocalizedClientLink href="/"
                                     className="text-[18px] md:text-[24px] lg:text-[28px] font-semibold tracking-[0.15em] lg:tracking-[0.3em] uppercase text-gray-900 leading-none">
                  {brandData?.sitename || "LILA ZEN"}
                </LocalizedClientLink>
              </div>

              {/* 右侧：功能按钮 (固定宽度 lg:w-48) */}
              <div className="flex-1 lg:w-48 lg:flex-none flex justify-end items-center gap-x-4 lg:gap-x-6 h-full">
                <div className="hidden lg:flex items-center relative group h-full">
                  <button className="text-gray-700 hover:text-pink-600 transition-all flex items-center gap-x-1">
                    <ActiveRegion/>
                  </button>
                  <div className="absolute top-full right-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[110]">
                    <div className="w-48 bg-white border shadow-xl rounded-xl p-4 mt-1">
                      <HeaderCountrySelect regions={regions}/>
                      <div className="mt-4 pt-4 border-t border-gray-50">
                        <HeaderLanguageSelect locales={locales} currentLocale={currentLocale}/>
                      </div>
                    </div>
                  </div>
                </div>

                <LocalizedClientLink href="/account" className="text-gray-700 hover:text-pink-600 flex items-center justify-center min-w-[24px]">
                  <User size={20}/>
                </LocalizedClientLink>

                <Suspense fallback={<ShoppingBag size={20}/>}>
                  <div className="flex items-center justify-center translate-y-[1.5px] min-w-[24px]">
                    <CartButton/>
                  </div>
                </Suspense>
              </div>
            </div>

            {/* 第二行：PC 菜单 */}
            <div className="hidden lg:block relative">
              {/* PC Logo 绝对定位在左侧 */}
              <div className="absolute left-0 -top-[60px] z-[130] h-[60px] flex items-center">
                <LocalizedClientLink href="/" className="active:scale-95 transition-transform block">
                  {logoUrl && (
                      <img src={logoUrl} alt="Logo" className="h-20 w-auto object-contain"/>
                  )}
                </LocalizedClientLink>
              </div>
              <NavLinks menuTree={menuTree}/>
            </div>
          </nav>
        </header>
      </div>
  )
}