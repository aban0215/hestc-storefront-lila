"use server"

import { Suspense } from "react"
import { listRegions } from "@lib/data/regions"
import { listLocales } from "@lib/data/locales"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import DesktopPreferences from "@modules/layout/components/desktop-preferences"
import { User } from "@medusajs/icons"
import MobileMenu from "@modules/layout/templates/nav/mobile-menu"
import SearchBarDirect from "@modules/search/components/modal"
import NavLinks from "@modules/layout/templates/nav/NavLinks"
import { getBrandData, getMenuData } from "@lib/strapi/header-data"

/**
 * 从 countryCode 推导 Strapi locale（不读 cookie，避免禁用 ISR）
 */
function localeFromCountry(countryCode: string): string {
  // 目前仅 US 市场，始终返回 en-US
  return "en-US"
}

export default async function Nav({ countryCode }: { countryCode: string }) {
  const currentLocale = localeFromCountry(countryCode)
  const [regions, locales, brandData, menuTree] = await Promise.all([
    listRegions(),
    listLocales(),
    getBrandData(currentLocale),
    getMenuData(currentLocale),
  ])

  const logoUrl = brandData?.logo?.url
    ? (brandData.logo.url.startsWith("http://")
        ? brandData.logo.url.replace("http://", "https://")
        : brandData.logo.url.startsWith("https://")
          ? brandData.logo.url
          : `${process.env.NEXT_PUBLIC_STRAPI_API_URL}${brandData.logo.url}`)
    : null

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100">
      {/* ── 顶栏 ── */}
      <div className="mx-auto max-w-[1440px] px-5 lg:px-8">
        <div className="flex items-center h-12 lg:h-14">

          {/* 左：Logo */}
          <div className="flex items-center gap-4 shrink-0">
            <Logo logoUrl={logoUrl} sitename={brandData?.sitename} />
          </div>

          {/* 中：PC 分类链接 */}
          <div className="hidden lg:flex flex-1 justify-center h-full">
            <NavLinks menuTree={menuTree} />
          </div>

          {/* 右：图标 + 移动汉堡 */}
          <div className="flex items-center gap-1 lg:gap-2 shrink-0">
            <SearchBarDirect variant="icon" />
            <div className="hidden lg:block">
              <DesktopPreferences regions={regions} locales={locales} currentLocale={currentLocale} />
            </div>
            <LocalizedClientLink
              href="/account"
              className="hidden lg:flex text-gray-700 hover:text-black w-9 h-9 items-center justify-center rounded-full hover:bg-gray-50 transition-colors"
            >
              <User />
            </LocalizedClientLink>
            <Suspense fallback={<div className="w-9 h-9" />}>
              <CartButton />
            </Suspense>
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

        </div>
      </div>
    </header>
  )
}

function Logo({ logoUrl, sitename }: { logoUrl: string | null; sitename?: string }) {
  return (
    <LocalizedClientLink href="/" className="flex items-center shrink-0">
      {logoUrl ? (
        <img src={logoUrl} alt={sitename || "Logo"} className="h-8 lg:h-9 w-auto object-contain" />
      ) : (
        <span className="text-lg font-black tracking-[0.12em] uppercase whitespace-nowrap text-gray-900">
          {sitename || "YUNJOY"}
        </span>
      )}
    </LocalizedClientLink>
  )
}