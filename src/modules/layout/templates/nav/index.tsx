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
import { getBrandData, getMenuData } from "@lib/strapi/header-data"

async function getCurrentLocale() {
  try {
    const locale = await getLocale()
    return locale || 'en-US'
  } catch (error) { return 'en-US' }
}

export default async function Nav() {
  const currentLocale = await getCurrentLocale()
  const [regions, locales, brandData, menuTree] = await Promise.all([
    listRegions(),
    listLocales(),
    getBrandData(currentLocale),
    getMenuData(currentLocale),
  ])

  const logoUrl = brandData?.logo?.url ? `${brandData.logo.url.startsWith('http') ? '' : process.env.NEXT_PUBLIC_STRAPI_API_URL}${brandData.logo.url}` : null

  return (
      <div className="sticky top-0 inset-x-0 z-[100] w-full bg-white">
        {/* 顶层容器：隔离带 */}
        <div className="relative z-[110] bg-white shadow-sm border-b border-gray-100">
          <header className="mx-auto px-4 lg:px-8 h-[60px] lg:h-[80px] bg-white relative">

            {/* 🔧 核心内容区：移动端 grid 三列居中 Logo，PC 端 flex 三区域 */}
            <div className="grid grid-cols-3 lg:flex lg:justify-between items-center h-full bg-white relative z-[120]">

              {/* 左侧：移动端汉堡菜单 / PC 端 Logo */}
              <div className="flex items-center h-full bg-white relative z-[130]">
                {/* 移动端汉堡菜单 */}
                <div className="lg:hidden pr-2 bg-white">
                  <MobileMenu menuTree={menuTree} brandData={brandData} regions={regions} locales={locales} currentLocale={currentLocale} />
                </div>
                {/* PC 端 Logo */}
                <div className="hidden lg:block h-full">
                  <Logo logoUrl={logoUrl} sitename={brandData?.sitename} />
                </div>
              </div>

              {/* 🔧 中间：移动端 Logo 居中 / PC 端 NavLinks 菜单 */}
              <div className="flex items-center justify-center h-full bg-white relative z-[130]">
                {/* 移动端 Logo（居中） */}
                <div className="lg:hidden h-full">
                  <Logo logoUrl={logoUrl} sitename={brandData?.sitename} />
                </div>
                {/* PC 端菜单 */}
                <div className="hidden lg:flex flex-1 justify-center h-full bg-white relative z-[130] overflow-visible">
                  <NavLinks menuTree={menuTree} />
                </div>
              </div>

              {/* 右侧：图标区 - 搜索 + 用户 + 购物车 */}
              <div className="flex items-center gap-x-1 lg:gap-x-4 justify-end h-full bg-white relative z-[130]">

                {/* 🔍 移动端搜索图标（点击弹窗） */}
                <div className="lg:hidden bg-white">
                  <SearchBarDirect variant="icon" />
                </div>

                {/* 🔍 PC 端搜索图标（点击弹窗） */}
                <div className="hidden lg:block bg-white">
                  <SearchBarDirect variant="icon" />
                </div>

                {/* 🌐 语言/地区偏好（仅 PC） */}
                <div className="hidden lg:block bg-white">
                  <DesktopPreferences regions={regions} locales={locales} currentLocale={currentLocale} />
                </div>

                {/* 👤 用户中心 */}
                <LocalizedClientLink
                    href="/account"
                    className="text-gray-700 hover:text-black w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-50 transition-all bg-white"
                >
                  <User size={22} />
                </LocalizedClientLink>

                {/* 🛒 购物车 */}
                <div className="bg-white">
                  <Suspense fallback={<div className="w-9 h-9" />}><CartButton /></Suspense>
                </div>

              </div>

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
              {sitename || "MYBRAND"}
            </span>
        )}
      </LocalizedClientLink>
  )
}