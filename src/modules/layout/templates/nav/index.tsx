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
      <div className="sticky top-0 inset-x-0 z-[100] w-full bg-white border-b border-gray-100">
        <header className="relative">
          <nav className="content-container mx-auto px-4 lg:px-6">

            {/* --- 第一行：Logo 与 功能图标 (移动端/PC端共用) --- */}
            <div className="flex justify-between items-center h-[60px] lg:h-[80px]">

              {/* 左侧：移动端菜单 */}
              <div className="flex-1 flex items-center">
                <div className="lg:hidden">
                  <MobileMenu
                      menuTree={menuTree}
                      brandData={brandData}
                      regions={regions}
                      locales={locales}
                      currentLocale={currentLocale}
                  />
                </div>
                {/* PC 端可以在这里放 Country Select 或者留空 */}
                <div className="hidden lg:block">
                  <HeaderCountrySelect regions={regions} />
                </div>
              </div>

              {/* 中间：Logo (绝对对齐) */}
              <div className="flex-1 flex justify-center items-center">
                <Logo logoUrl={logoUrl} sitename={brandData?.sitename} />
              </div>

              {/* 右侧：用户与购物车 */}
              <div className="flex-1 flex justify-end items-center gap-x-2 lg:gap-x-4">
                <LocalizedClientLink
                    href="/account"
                    className="text-gray-700 hover:text-black w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-50 transition-all"
                >
                  <User size={22} />
                </LocalizedClientLink>

                <Suspense fallback={<div className="w-9 h-9" />}>
                  <CartButton />
                </Suspense>
              </div>
            </div>

            {/* --- 第二行：搜索框 (全平台显示) --- */}
            {/* 移动端：占满宽度，下方留边距
              PC端：限制最大宽度并居中，与第一行有视觉区分
          */}
            <div className="flex justify-center items-center pb-4 lg:pb-6">
              <div className="w-full lg:max-w-[700px]">
                <SearchModal variant="searchbar" />
              </div>
            </div>

            {/* --- 第三行：PC端主菜单 (仅PC显示) --- */}
            <div className="hidden lg:flex justify-center items-center h-[50px] border-t border-gray-50">
              <ul className="flex items-center gap-x-12">
                {menuTree.map((item) => (
                    <li key={item.id}>
                      <LocalizedClientLink
                          href={item.url || "/"}
                          className="text-[13px] font-medium uppercase tracking-[0.2em] text-gray-700 hover:text-black transition-colors"
                      >
                        {item.title}
                      </LocalizedClientLink>
                    </li>
                ))}
              </ul>
            </div>

          </nav>
        </header>
      </div>
  )
}

// Logo 组件：针对响应式做了高度适配
function Logo({ logoUrl, sitename }: { logoUrl: string | null, sitename?: string }) {
  return (
      <LocalizedClientLink href="/" className="flex items-center">
        {logoUrl ? (
            <img
                src={logoUrl}
                alt="Logo"
                className="h-[40px] md:h-[50px] lg:h-[60px] w-auto object-contain"
            />
        ) : (
            <span className="text-[18px] md:text-[22px] lg:text-[26px] font-bold tracking-[0.2em] uppercase whitespace-nowrap">
          {sitename || "LILA ZEN"}
        </span>
        )}
      </LocalizedClientLink>
  )
}