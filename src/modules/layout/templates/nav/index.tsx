"use server"

import { Suspense } from "react"
import { listRegions } from "@lib/data/regions"
import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import HeaderCountrySelect from "@modules/layout/components/header-country-select"
import HeaderLanguageSelect from "@modules/layout/components/header-language-select"
import { User, ShoppingBag,BarsThree  } from "@medusajs/icons" // 引入 Menu 图标
import ActiveRegion from "@modules/layout/templates/nav/active-region";
import NavLinks from "@modules/layout/templates/nav/NavLinks";
import MobileMenu from "@modules/layout/templates/nav/mobile-menu";
import SearchModal from "@modules/search/components/modal"

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
  const baseUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL
  const logoUrl = brandData?.logo?.url ? `${brandData.logo.url.startsWith('http') ? '' : baseUrl}${brandData.logo.url}` : null

  return (
      <div className="sticky top-0 inset-x-0 z-[100] w-full">
        <header className="relative bg-white border-b border-gray-100">
          <nav className="content-container mx-auto px-4 lg:px-6 relative">

            <div className="flex justify-between items-center h-[60px] lg:h-[80px]">

              {/* --- 左侧区域 --- */}
              <div className="flex-1 flex items-center gap-x-4">
                {/* 移动端逻辑保持不变 */}
                <div className="lg:hidden">
                  <MobileMenu
                      menuTree={menuTree}
                      brandData={brandData}
                      regions={regions}
                      locales={locales}
                      currentLocale={currentLocale}
                  />
                </div>

                {/* PC端：直接渲染组件，不要包在 absolute 容器里，否则 fixed 定位有时会失效 */}
                <div className="hidden lg:block">
                  <MobileMenu
                      menuTree={menuTree}
                      brandData={brandData}
                      regions={regions}
                      locales={locales}
                      currentLocale={currentLocale}
                      isDesktop={true} // 传入这个标记
                  />
                </div>

                {/* 搜索按钮 */}
                <div className="flex items-center group cursor-pointer">
                  <SearchModal />
                  {/*<span className="text-[10px] uppercase tracking-[0.2em] font-bold hidden lg:block ml-1">Search</span>*/}
                </div>
              </div>

              {/* --- 中间区域：Logo (绝对居中) --- */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <LocalizedClientLink href="/" className="flex items-center justify-center">
                  {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="h-10 lg:h-14 w-auto object-contain" />
                  ) : (
                      <span className="text-[18px] lg:text-[24px] font-bold tracking-[0.3em] uppercase whitespace-nowrap">
                    {brandData?.sitename || "LILA ZEN"}
                  </span>
                  )}
                </LocalizedClientLink>
              </div>

              {/* --- 右侧区域 --- */}
              <div className="flex-1 flex justify-end items-center gap-x-4 lg:gap-x-5">
                <LocalizedClientLink href="/account" className="text-gray-700 hover:text-black">
                  <User size={22} />
                </LocalizedClientLink>

                <Suspense fallback={<ShoppingBag size={22}/>}>
                  <div className="flex items-center justify-center">
                    <CartButton/>
                  </div>
                </Suspense>
              </div>
            </div>
          </nav>
        </header>
      </div>
  )
}