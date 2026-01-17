"use server"

import { Suspense } from "react"
import { listRegions } from "@lib/data/regions"
import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
// 引入我们新做的“PC端偏好设置”组件
import DesktopPreferences from "@modules/layout/components/desktop-preferences"
import { User } from "@medusajs/icons"
import MobileMenu from "@modules/layout/templates/nav/mobile-menu";
import SearchModal from "@modules/search/components/modal"
import NavLinks from "@modules/layout/templates/nav/NavLinks";

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
          <nav className="mx-auto px-4 lg:px-8">

            {/* --- 第一行：[Logo] -- [Search] -- [Icons] --- */}
            <div className="flex items-center h-[60px] lg:h-[90px]">

              {/* 左侧：移动端菜单图标 & PC端 Logo */}
              <div className="flex items-center pr-6 lg:pr-12">
                <div className="lg:hidden">
                  <MobileMenu
                      menuTree={menuTree}
                      brandData={brandData}
                      regions={regions}
                      locales={locales}
                      currentLocale={currentLocale}
                  />
                </div>
                <div className="hidden lg:block">
                  <Logo logoUrl={logoUrl} sitename={brandData?.sitename} />
                </div>
              </div>

              {/* 中间：移动端 Logo & PC端 搜索框 */}
              <div className="flex-1 flex items-center justify-center lg:justify-start">
                {/* 移动端 Logo (绝对居中) */}
                <div className="lg:hidden absolute left-1/2 -translate-x-1/2">
                  <Logo logoUrl={logoUrl} sitename={brandData?.sitename} />
                </div>
                {/* PC端 搜索框 (真实搜索组件) */}
                <div className="hidden lg:block w-full max-w-[800px]">
                  <SearchModal />
                </div>
              </div>

              {/* 右侧：功能图标 */}
              <div className="flex items-center gap-x-2 lg:gap-x-5 pl-6 lg:pl-12">
                {/* PC端：国家/语言 偏好设置 */}
                <div className="hidden lg:block">
                  <DesktopPreferences
                      regions={regions}
                      locales={locales}
                      currentLocale={currentLocale}
                  />
                </div>

                {/* 用户账户 */}
                <LocalizedClientLink
                    href="/account"
                    className="text-gray-700 hover:text-black w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-50 transition-all"
                >
                  <User size={22} />
                </LocalizedClientLink>

                {/* 购物车 */}
                <Suspense fallback={<div className="w-9 h-9" />}>
                  <CartButton />
                </Suspense>
              </div>
            </div>

            {/* --- 第二行：移动端搜索框 / PC端 联动菜单 --- */}
            <div className="flex justify-center items-center pb-4 lg:pb-0 lg:h-[50px] lg:border-t lg:border-gray-50">

              {/* 移动端：显示搜索框 */}
              <div className="w-full lg:hidden">
                <SearchModal />
              </div>

              {/* PC端：这里必须调用 NavLinks 组件，才能触发滑出面板 */}
              <NavLinks menuTree={menuTree} />

            </div>

          </nav>
        </header>
      </div>
  )
}

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