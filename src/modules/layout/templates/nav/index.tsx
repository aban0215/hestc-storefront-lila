"use server"

import { Suspense } from "react"
import { listRegions } from "@lib/data/regions"
import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import HeaderCountrySelect from "@modules/layout/components/header-country-select"
import { User } from "@medusajs/icons"
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

            {/* --- 第一行：[移动端: 菜单-Logo-车] | [PC端: Logo-搜索-图标] --- */}
            <div className="flex justify-between items-center h-[60px] lg:h-[90px] gap-x-4">

              {/* 左侧区域 */}
              <div className="flex-1 lg:flex-none flex items-center">
                {/* 仅移动端显示菜单图标 */}
                <div className="lg:hidden">
                  <MobileMenu
                      menuTree={menuTree}
                      brandData={brandData}
                      regions={regions}
                      locales={locales}
                      currentLocale={currentLocale}
                  />
                </div>
                {/* PC 端 Logo 靠左 */}
                <div className="hidden lg:block">
                  <Logo logoUrl={logoUrl} sitename={brandData?.sitename} />
                </div>
              </div>

              {/* 中间区域 */}
              <div className="flex-[2] flex justify-center items-center">
                {/* 移动端 Logo 居中 */}
                <div className="lg:hidden">
                  <Logo logoUrl={logoUrl} sitename={brandData?.sitename} />
                </div>
                {/* PC 端 搜索条 */}
                <div className="hidden lg:block w-full max-w-[600px]">
                  <SearchModal />
                </div>
              </div>

              {/* 右侧区域 */}
              <div className="flex-1 lg:flex-none flex justify-end items-center gap-x-2 lg:gap-x-4">
                {/* 国家选择器 (PC端显示在右侧功能区) */}
                <div className="hidden lg:flex items-center">
                  <HeaderCountrySelect regions={regions} />
                </div>

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

            {/* --- 第二行：[移动端: 搜索框] | [PC端: 主菜单] --- */}
            <div className="flex justify-center items-center pb-4 lg:pb-0 lg:h-[50px] lg:border-t lg:border-gray-50">

              {/* 移动端显示的搜索框 */}
              <div className="w-full lg:hidden">
                <SearchModal />
              </div>

              {/* PC 端显示的水平主菜单 */}
              <ul className="hidden lg:flex items-center gap-x-12">
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

// Logo 组件：保持响应式缩放
function Logo({ logoUrl, sitename }: { logoUrl: string | null, sitename?: string }) {
  return (
      <LocalizedClientLink href="/" className="flex items-center">
        {logoUrl ? (
            <img
                src={logoUrl}
                alt="Logo"
                className="h-[40px] md:h-[50px] lg:h-[65px] w-auto object-contain"
            />
        ) : (
            <span className="text-[18px] md:text-[22px] lg:text-[26px] font-bold tracking-[0.2em] uppercase whitespace-nowrap">
          {sitename || "LILA ZEN"}
        </span>
        )}
      </LocalizedClientLink>
  )
}