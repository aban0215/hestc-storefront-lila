"use client"

import { useState, useEffect, useRef } from "react"
import { Menu, X, ChevronRight, Globe, ChevronDown } from "lucide-react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { usePathname, useRouter } from "next/navigation"
import { updateRegion } from "@lib/data/cart"
import { updateLocale } from "@lib/data/locale-actions"
import { getMenuHref } from "@lib/menu-utils"

export default function MobileMenu({
    menuTree,
    brandData,
    regions,
    locales,
    currentLocale,
    isDesktop = false,
}: {
    menuTree: any[]
    brandData: any
    regions: any
    locales: any
    currentLocale: string
    isDesktop?: boolean
}) {
    const [isOpen, setIsOpen] = useState(false)
    const [openL1, setOpenL1] = useState<number | null>(null)
    const [openL2, setOpenL2] = useState<number | null>(null)
    const [showCountries, setShowCountries] = useState(false)
    const [showLangs, setShowLangs] = useState(false)
    const [mounted, setMounted] = useState(false)

    const pathname = usePathname()
    const router = useRouter()
    const drawerRef = useRef<HTMLDivElement>(null)

    useEffect(() => { setMounted(true) }, [])
    useEffect(() => { setIsOpen(false) }, [pathname])

    // 锁定 body 滚动
    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : ""
        return () => { document.body.style.overflow = "" }
    }, [isOpen])

    // ESC 关闭
    useEffect(() => {
        if (!isOpen) return
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setIsOpen(false) }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [isOpen])

    const handleRegionChange = async (countryCode: string) => {
        try {
            const parts = pathname.split("/")
            if (parts.length > 1) parts.splice(1, 1)
            await updateRegion(countryCode, parts.join("/") || "/")
            setIsOpen(false)
        } catch { /* ignore */ }
    }

    const handleLocaleChange = async (code: string) => {
        try {
            await updateLocale(code)
            setIsOpen(false)
            router.refresh()
        } catch { /* ignore */ }
    }

    // 递归渲染子级菜单（L3+）
    function SubLinksMobile({ items, depth }: { items: any[]; depth: number }) {
        return (
            <>
                {items.map((item: any) => (
                    <div key={item.id}>
                        <LocalizedClientLink
                            href={getMenuHref(item.link_type, item.slug, item.medusaHandle)}
                            className={depth >= 3
                                ? "block py-1.5 pl-3 text-[11px] uppercase tracking-[0.04em] text-gray-400 hover:text-rose-500 transition-colors border-l border-gray-200"
                                : "block py-2 text-[12px] uppercase tracking-[0.05em] text-gray-500 hover:text-rose-500 transition-colors"}
                            onClick={() => setIsOpen(false)}
                        >
                            {item.title}
                        </LocalizedClientLink>
                        {item.children?.length > 0 && (
                            <SubLinksMobile items={item.children} depth={depth + 1} />
                        )}
                    </div>
                ))}
            </>
        )
    }

    if (!mounted) {
        return (
            <button className="p-2 -ml-2 text-gray-800">
                <Menu size={22} strokeWidth={1.5} />
            </button>
        )
    }

    const countryCode = pathname.split("/")[1]
    const allCountries = regions?.flatMap((r: any) => r.countries).sort((a: any, b: any) => a.display_name.localeCompare(b.display_name)) || []
    const currentCountry = allCountries.find((c: any) => c.iso_2 === countryCode)?.display_name || "United States"
    const currentLang = locales?.find((l: any) => l.code === currentLocale)?.name || "English"

    return (
        <>
            {/* ── 汉堡按钮 ── */}
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-x-2 p-2 -ml-2 text-gray-800 hover:text-gray-600 transition-colors"
            >
                <Menu size={22} strokeWidth={1.5} />
            </button>

            {/* ── 遮罩 ── */}
            <div
                className={`fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
                onClick={() => setIsOpen(false)}
            />

            {/* ── 右侧抽屉 ── */}
            <div
                ref={drawerRef}
                className={`fixed top-0 right-0 z-[101] h-full w-[88vw] max-w-[420px] bg-white shadow-2xl transition-transform duration-[400ms] ease-[cubic-bezier(0.25,1,0.5,1)] flex flex-col pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] ${
                    isOpen ? "translate-x-0" : "translate-x-full"
                }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 h-14 border-b border-gray-100 shrink-0">
                    <span className="text-xs font-black tracking-[0.25em] uppercase text-gray-900">
                        {brandData?.sitename || "Menu"}
                    </span>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 -mr-2 text-gray-400 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-50"
                    >
                        <X size={20} strokeWidth={1.5} />
                    </button>
                </div>

                {/* 菜单内容 */}
                <div className="flex-1 overflow-y-auto overscroll-contain">
                    <nav className="px-6 py-4">
                        {menuTree?.map((item) => {
                            const hasKids = item.children?.length > 0
                            const isL1Open = openL1 === item.id
                            return (
                                <div key={item.id} className="border-b border-gray-50 last:border-0">
                                    <div className="flex items-center">
                                        {hasKids ? (
                                            /* 有子菜单：点击标题展开下钻 */
                                            <button
                                                onClick={() => {
                                                    setOpenL1(isL1Open ? null : item.id)
                                                    setOpenL2(null)
                                                }}
                                                className="flex-1 flex items-center justify-between py-4 text-left"
                                            >
                                                <span className="text-sm font-semibold uppercase tracking-[0.1em] text-gray-900 hover:text-rose-600 transition-colors">
                                                    {item.title}
                                                </span>
                                                <ChevronRight
                                                    size={16}
                                                    className={`transition-transform duration-300 shrink-0 ${
                                                        isL1Open ? "rotate-90 text-rose-500" : "text-gray-300"
                                                    }`}
                                                />
                                            </button>
                                        ) : (
                                            /* 无子菜单：直接跳转 */
                                            <LocalizedClientLink
                                                href={getMenuHref(item.link_type, item.slug, item.medusaHandle)}
                                                className="flex-1 py-4 text-sm font-semibold uppercase tracking-[0.1em] text-gray-900 hover:text-rose-600 transition-colors"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                {item.title}
                                            </LocalizedClientLink>
                                        )}
                                    </div>

                                    {/* L2 子菜单 */}
                                    {hasKids && (
                                        <div
                                            className={`overflow-hidden transition-all duration-[400ms] ease-[cubic-bezier(0.25,1,0.5,1)] ${
                                                isL1Open ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                                            }`}
                                        >
                                            <div className="ml-3 pl-4 border-l-2 border-rose-100 pb-3">
                                                {item.children.map((child: any) => {
                                                    const hasGrand = child.children?.length > 0
                                                    const isL2Open = openL2 === child.id
                                                    return (
                                                        <div key={child.id}>
                                                            <div className="flex items-center">
                                                                {hasGrand ? (
                                                                    /* 有孙菜单：点击标题展开下钻 */
                                                                    <button
                                                                        onClick={() => setOpenL2(isL2Open ? null : child.id)}
                                                                        className="flex-1 flex items-center justify-between py-3 text-left"
                                                                    >
                                                                        <span className="text-[13px] font-semibold uppercase tracking-[0.06em] text-gray-700 hover:text-rose-600 transition-colors">
                                                                            {child.title}
                                                                        </span>
                                                                        <ChevronRight
                                                                            size={14}
                                                                            className={`transition-transform duration-300 shrink-0 ${
                                                                                isL2Open ? "rotate-90 text-rose-400" : "text-gray-300"
                                                                            }`}
                                                                        />
                                                                    </button>
                                                                ) : (
                                                                    /* 无子菜单：直接跳转 */
                                                                    <LocalizedClientLink
                                                                        href={getMenuHref(child.link_type, child.slug, child.medusaHandle)}
                                                                        className="flex-1 py-3 text-[13px] font-semibold uppercase tracking-[0.06em] text-gray-700 hover:text-rose-600 transition-colors"
                                                                        onClick={() => setIsOpen(false)}
                                                                    >
                                                                        {child.title}
                                                                    </LocalizedClientLink>
                                                                )}
                                                            </div>

                                                            {/* L3 */}
                                                            {hasGrand && (
                                                                <div
                                                                    className={`overflow-hidden transition-all duration-350 ease-[cubic-bezier(0.25,1,0.5,1)] bg-gray-50 rounded-lg ${
                                                                        isL2Open ? "max-h-[2000px] opacity-100 my-1" : "max-h-0 opacity-0"
                                                                    }`}
                                                                >
                                                                    <div className="px-3 py-2">
                                                                        <SubLinksMobile items={child.children} depth={2} />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </nav>

                    {/* ── 偏好设置 ── */}
                    <div className="px-6 py-6 border-t border-gray-100 mt-2">
                        <div className="flex items-center gap-x-2 mb-5 text-gray-500">
                            <Globe size={16} strokeWidth={1.5} />
                            <span className="text-[11px] uppercase tracking-[0.2em] font-bold">Preferences</span>
                        </div>

                        {/* 地区 */}
                        <button
                            onClick={() => setShowCountries(!showCountries)}
                            className="w-full flex items-center justify-between py-3 text-left"
                        >
                            <span className="text-[11px] uppercase tracking-widest font-medium text-gray-500">Shipping to</span>
                            <div className="flex items-center gap-x-2">
                                <span className="text-xs text-gray-900 font-semibold">{currentCountry}</span>
                                <ChevronDown size={14} className={`transition-transform duration-200 ${showCountries ? "rotate-180" : ""} text-gray-400`} />
                            </div>
                        </button>
                        <div className={`overflow-hidden transition-all duration-300 ${showCountries ? "max-h-[40vh] overflow-y-auto bg-gray-50 rounded-xl px-3 py-2 mb-2" : "max-h-0"}`}>
                            {allCountries.map((c: any) => (
                                <button
                                    key={c.iso_2}
                                    onClick={() => handleRegionChange(c.iso_2)}
                                    className={`w-full text-left py-2.5 text-[11px] uppercase tracking-[0.05em] border-b border-gray-100 last:border-0 ${
                                        c.iso_2 === countryCode ? "text-black font-bold" : "text-gray-500"
                                    }`}
                                >
                                    {c.display_name}
                                </button>
                            ))}
                        </div>

                        {/* 语言 */}
                        <button
                            onClick={() => setShowLangs(!showLangs)}
                            className="w-full flex items-center justify-between py-3 text-left"
                        >
                            <span className="text-[11px] uppercase tracking-widest font-medium text-gray-500">Language</span>
                            <div className="flex items-center gap-x-2">
                                <span className="text-xs text-gray-900 font-semibold">{currentLang}</span>
                                <ChevronDown size={14} className={`transition-transform duration-200 ${showLangs ? "rotate-180" : ""} text-gray-400`} />
                            </div>
                        </button>
                        <div className={`overflow-hidden transition-all duration-300 ${showLangs ? "max-h-[40vh] overflow-y-auto bg-gray-50 rounded-xl px-3 py-2" : "max-h-0"}`}>
                            {locales?.map((l: any) => (
                                <button
                                    key={l.code}
                                    onClick={() => handleLocaleChange(l.code)}
                                    className={`w-full text-left py-2.5 text-[11px] uppercase tracking-[0.05em] border-b border-gray-100 last:border-0 ${
                                        l.code === currentLocale ? "text-black font-bold" : "text-gray-500"
                                    }`}
                                >
                                    {l.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 shrink-0 text-center">
                    <p className="text-[10px] text-gray-300 uppercase tracking-[0.3em]">
                        © {new Date().getFullYear()} {brandData?.sitename || "YunJoy"}
                    </p>
                </div>
            </div>
        </>
    )
}