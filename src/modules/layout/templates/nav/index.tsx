"use server"

import { Suspense } from "react"
import { listRegions } from "@lib/data/regions"
import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import DesktopPreferences from "@modules/layout/components/desktop-preferences"
import { User } from "@medusajs/icons"
import MobileMenu from "@modules/layout/templates/nav/mobile-menu";
import SearchBarDirect from "@modules/search/components/modal"
import NavLinks from "@modules/layout/templates/nav/NavLinks";

async function getCurrentLocale() {
  try {
    const locale = await getLocale()
    return locale || 'en-US'
  } catch (error) { return 'en-US' }
}

async function getBrandData(locale: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/lila-header?locale=${locale}&populate=*`, { cache: 'no-store' })
    const data = await res.json()
    return data.data
  } catch (error) { return null }
}

async function getMenuData(locale: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/lila-menuitems?locale=${locale}&populate=*&sort=order:asc`, { cache: 'no-store' })
    const data = await res.json()
    return data.data || []
  } catch (error) { return [] }
}

function buildMenuTree(items: any[]) {
  const visibleItems = items.filter(item => item.visible === true)
  const topLevelItems = visibleItems.filter(item => !item.parent)
  return topLevelItems.map(item => ({
    ...item,
    children: visibleItems.filter(child => child.parent?.id === item.id).sort((a, b) => a.order - b.order)
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
  const logoUrl = brandData?.logo?.url ? `${brandData.logo.url.startsWith('http') ? '' : process.env.NEXT_PUBLIC_STRAPI_API_URL}${brandData.logo.url}` : null

  return (
      <div className="sticky top-0 inset-x-0 z-[100] w-full bg-white">
        {/* 顶层容器：隔离带 */}
        <div className="relative z-[110] bg-white shadow-sm border-b border-gray-100">
          <header className="mx-auto px-4 lg:px-8 h-[60px] lg:h-[80px] bg-white relative">

            {/* 核心内容区 */}
            <div className="flex items-center justify-between h-full bg-white relative z-[120]">

              {/* Logo 区 */}
              <div className="flex items-center lg:w-[240px] h-full bg-white relative z-[130]">
                <div className="lg:hidden pr-4 bg-white">
                  <MobileMenu menuTree={menuTree} brandData={brandData} regions={regions} locales={locales} currentLocale={currentLocale} />
                </div>
                <Logo logoUrl={logoUrl} sitename={brandData?.sitename} />
              </div>

              {/* 🔧 菜单区：添加 relative + overflow-visible，作为 absolute 下拉面板的定位基准 */}
              <div className="hidden lg:flex flex-1 justify-center h-full bg-white relative z-[130] overflow-visible">
                <NavLinks menuTree={menuTree} />
              </div>

              {/* 图标区 */}
              <div className="flex items-center gap-x-1 lg:gap-x-4 justify-end lg:w-[240px] h-full bg-white relative z-[130]">
                <div className="hidden lg:block bg-white">
                  <SearchBarDirect variant="icon" />
                </div>
                <div className="hidden lg:block bg-white">
                  <DesktopPreferences regions={regions} locales={locales} currentLocale={currentLocale} />
                </div>
                <LocalizedClientLink href="/account" className="text-gray-700 hover:text-black w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-50 transition-all bg-white">
                  <User size={22} />
                </LocalizedClientLink>
                <div className="bg-white">
                  <Suspense fallback={<div className="w-9 h-9" />}><CartButton /></Suspense>
                </div>
              </div>

            </div>

            {/* 移动端搜索 */}
            <div className="lg:hidden px-4 pb-4 bg-white relative z-[120]">
              <SearchBarDirect />
            </div>
          </header>
        </div>
      </div>
  )
}

function Logo({ logoUrl, sitename }: { logoUrl: string | null, sitename?: string }) {
  return (
      <LocalizedClientLink href="/" className="flex items-center h-full bg-white relative z-[140]">
        {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="h-[40px] md:h-[50px] lg:h-[60px] w-auto object-contain" />
        ) : (
            <span className="text-[18px] md:text-[22px] lg:text-[24px] font-bold tracking-[0.2em] uppercase whitespace-nowrap bg-white">
          {sitename || "LILA ZEN"}
        </span>
        )}
      </LocalizedClientLink>
  )
}