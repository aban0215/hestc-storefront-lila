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
      <div className="sticky top-0 inset-x-0 z-[100] w-full bg-white">
        <header className="relative border-b border-gray-100">
          <nav className="content-container mx-auto px-4 lg:px-6 relative">

            {/* 第一行：图标与 Logo */}
            <div className="flex justify-between items-center h-[70px] lg:h-[80px]">

              {/* 左侧：菜单图标 (移动端放大) */}
              <div className="flex-1 flex items-center">
                <div className="lg:hidden transform scale-[1.5] origin-left">
                  <MobileMenu
                      menuTree={menuTree}
                      brandData={brandData}
                      regions={regions}
                      locales={locales}
                      currentLocale={currentLocale}
                  />
                </div>
                <div className="hidden lg:block">
                  <MobileMenu
                      menuTree={menuTree}
                      brandData={brandData}
                      regions={regions}
                      locales={locales}
                      currentLocale={currentLocale}
                      isDesktop={true}
                  />
                </div>

                {/* PC 端保留原搜索位置，移动端隐藏 */}
                <div className="hidden lg:flex items-center ml-4">
                  <SearchModal />
                </div>
              </div>

              {/* 中间：Logo (移动端放大) */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center pointer-events-none">
                <LocalizedClientLink href="/" className="flex items-center justify-center pointer-events-auto">
                  {logoUrl ? (
                      <img
                          src={logoUrl}
                          alt="Logo"
                          className="h-[55px] lg:h-[72px] w-auto object-contain transition-all duration-300 transform lg:scale-100 scale-[1.2]"
                      />
                  ) : (
                      <span className="text-[26px] lg:text-[32px] font-bold tracking-[0.3em] uppercase">
                    {brandData?.sitename || "LILA ZEN"}
                  </span>
                  )}
                </LocalizedClientLink>
              </div>

              {/* 右侧：会员与购物车 (移动端图标翻倍) */}
              <div className="flex-1 flex justify-end items-center gap-x-4 lg:gap-x-2">
                <LocalizedClientLink
                    href="/account"
                    className="text-gray-700 w-10 h-10 flex items-center justify-center"
                >
                  {/* 移动端用 scale 放大，PC端保持 22 */}
                  <User size={22} className="lg:scale-100 scale-[1.8]" />
                </LocalizedClientLink>

                <Suspense fallback={<div className="w-10 h-10" />}>
                  <div className="lg:scale-100 scale-[1.8] transform origin-right">
                    <CartButton />
                  </div>
                </Suspense>
              </div>
            </div>

            {/* 第二行：移动端专用搜索框 (仅在移动端显示) */}
            <div className="lg:hidden pb-4 px-2">
              <LocalizedClientLink href="/search" className="w-full">
                <div className="flex items-center w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-400">
                  <MagnifyingGlass size={20} className="mr-3" />
                  <span className="text-sm">Buscar en MAJA</span>
                </div>
              </LocalizedClientLink>
            </div>

          </nav>
        </header>
      </div>
  )
}