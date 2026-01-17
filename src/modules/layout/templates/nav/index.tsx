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
          <nav className="content-container mx-auto px-4 lg:px-6 relative text-black">

            {/* 第一行：功能图标层 */}
            <div className="flex justify-between items-center h-[70px] lg:h-[80px]">

              {/* 左侧：菜单图标 (移动端放大) */}
              <div className="flex-1 flex items-center">
                <div className="lg:hidden transform scale-[1.8] origin-left">
                  <MobileMenu {...props} /> {/* 简写，实际传入你的参数 */}
                </div>

                {/* PC 端：显示原来的图标搜索 */}
                <div className="hidden lg:flex items-center">
                  <SearchModal variant="icon" />
                </div>
              </div>

              {/* 中间：Logo (移动端放大) */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center">
                {/* 这里的 logoUrl 逻辑保持你原来的 */}
                <LocalizedClientLink href="/">
                  <img src={logoUrl} className="h-[55px] lg:h-[72px] scale-[1.3] lg:scale-100" />
                </LocalizedClientLink>
              </div>

              {/* 右侧：用户 & 购物车 (移动端图标放大) */}
              <div className="flex-1 flex justify-end items-center gap-x-6">
                <LocalizedClientLink href="/account">
                  <User size={22} className="lg:scale-100 scale-[1.8]" />
                </LocalizedClientLink>

                <div className="lg:scale-100 scale-[1.8] origin-right">
                  <Suspense fallback={<ShoppingBag size={22} />}>
                    <CartButton />
                  </Suspense>
                </div>
              </div>
            </div>

            {/* 第二行：移动端专用大搜索框 */}
            <div className="lg:hidden pb-4 px-2">
              {/* 调用新做的 searchbar 样式 */}
              <SearchModal variant="searchbar" />
            </div>

          </nav>
        </header>
      </div>
  )
}