"use client"

import { useState, useEffect } from "react"
import { X, ChevronRight, Globe } from "lucide-react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { usePathname, useRouter } from "next/navigation"
import { updateRegion } from "@lib/data/cart"
import { updateLocale } from "@lib/data/locale-actions"
import { getMenuHref } from "@lib/menu-utils"

type Props = {
    menuTree: any[]
    brandData: any
    regions: any
    locales: any
    currentLocale: string
}

export default function MenuOverlay({ menuTree, brandData, regions, locales, currentLocale }: Props) {
    const [isOpen, setIsOpen] = useState(false)
    const [activeL1, setActiveL1] = useState<number | null>(null)
    const [mounted, setMounted] = useState(false)

    const pathname = usePathname()
    const router = useRouter()

    useEffect(() => { setMounted(true) }, [])
    useEffect(() => { setIsOpen(false); setActiveL1(null) }, [pathname])
    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : ""
        return () => { document.body.style.overflow = "" }
    }, [isOpen])

    // ESC close
    useEffect(() => {
        if (!isOpen) return
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setIsOpen(false) }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [isOpen])

    // Auto-select first L1 on open (desktop)
    useEffect(() => {
        if (isOpen && menuTree?.length > 0 && activeL1 === null) {
            setActiveL1(menuTree[0].id)
        }
    }, [isOpen])

    const handleRegionChange = async (code: string) => {
        try {
            const parts = pathname.split("/")
            if (parts.length > 1) parts.splice(1, 1)
            await updateRegion(code, parts.join("/") || "/")
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
    function SubLinksOverlay({ items, depth }: { items: any[]; depth: number }) {
        const isFirstSub = depth === 2
        return (
            <div className={isFirstSub ? "flex flex-col gap-y-2.5" : "ml-3 mt-0.5 flex flex-col gap-y-1 border-l border-gray-100 pl-2.5"}>
                {items.map((item: any) => (
                    <div key={item.id}>
                        <LocalizedClientLink
                            href={getMenuHref(item.link_type, item.slug, item.medusaHandle)}
                            className={isFirstSub
                                ? "text-[13px] text-gray-500 hover:text-gray-900 uppercase tracking-[0.04em] transition-colors duration-200"
                                : "text-[11px] text-gray-400 hover:text-gray-900 uppercase tracking-[0.04em] transition-colors duration-200"}
                            onClick={() => setIsOpen(false)}
                        >
                            {item.title}
                        </LocalizedClientLink>
                        {item.children?.length > 0 && (
                            <SubLinksOverlay items={item.children} depth={depth + 1} />
                        )}
                    </div>
                ))}
            </div>
        )
    }

    const activeItem = menuTree?.find((i) => i.id === activeL1)
    const countryCode = pathname.split("/")[1]
    const allCountries = regions?.flatMap((r: any) => r.countries).sort((a: any, b: any) => a.display_name.localeCompare(b.display_name)) || []
    const currentCountry = allCountries.find((c: any) => c.iso_2 === countryCode)?.display_name || "United States"
    const currentLang = locales?.find((l: any) => l.code === currentLocale)?.name || "English"

    if (!mounted) {
        return (
            <button className="flex items-center gap-x-2 text-xs font-bold uppercase tracking-[0.2em] text-gray-800 hover:text-gray-600 transition-colors">
                MENU
            </button>
        )
    }

    return (
        <>
            {/* ── MENU 按钮 ── */}
            <button
                onClick={() => setIsOpen(true)}
                className={`flex items-center gap-x-2 text-xs font-bold uppercase tracking-[0.2em] text-gray-800 hover:text-gray-600 transition-colors ${
                    isOpen ? "opacity-0 pointer-events-none" : ""
                }`}
            >
                MENU
            </button>

            {/* ── 全屏遮罩 ── */}
            <div
                className={`fixed inset-0 z-[200] bg-white transition-all duration-[500ms] ease-[cubic-bezier(0.25,1,0.5,1)] ${
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
            >
                {/* Top Bar */}
                <div className="flex items-center justify-between h-16 lg:h-20 px-5 lg:px-8 border-b border-gray-100">
                    {/* 左侧：Logo */}
                    <LocalizedClientLink
                        href="/"
                        className="text-lg lg:text-xl font-black tracking-[0.15em] uppercase text-gray-900"
                        onClick={() => setIsOpen(false)}
                    >
                        {brandData?.sitename || "YUNJOY"}
                    </LocalizedClientLink>

                    {/* 右侧：关闭 */}
                    <button
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-x-2 text-xs font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-gray-900 transition-colors"
                    >
                        CLOSE
                        <X size={18} strokeWidth={1.5} />
                    </button>
                </div>

                {/* ── Desktop: 双栏布局 ── */}
                <div className="hidden lg:flex h-[calc(100%-80px)]">
                    {/* 左侧：L1 分类列表 */}
                    <div className="w-[340px] xl:w-[400px] shrink-0 border-r border-gray-100 overflow-y-auto py-12 px-8 xl:px-12">
                        <nav className="flex flex-col gap-y-1">
                            {menuTree?.map((item) => {
                                const isActive = activeL1 === item.id
                                const hasKids = item.children?.length > 0
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveL1(item.id)}
                                        onMouseEnter={() => setActiveL1(item.id)}
                                        className={`group flex items-center justify-between w-full text-left py-4 px-4 rounded-xl transition-all duration-300 ${
                                            isActive
                                                ? "bg-gray-50"
                                                : "hover:bg-gray-50/50"
                                        }`}
                                    >
                                        <span
                                            className={`text-2xl xl:text-[28px] font-bold uppercase tracking-[0.04em] transition-colors duration-300 ${
                                                isActive ? "text-gray-900" : "text-gray-400 group-hover:text-gray-600"
                                            }`}
                                        >
                                            {item.title}
                                        </span>
                                        <ChevronRight
                                            size={18}
                                            className={`transition-all duration-300 ${
                                                isActive ? "opacity-100 text-gray-900 -translate-x-0" : "opacity-0 text-gray-300 translate-x-2"
                                            }`}
                                        />
                                    </button>
                                )
                            })}
                        </nav>
                    </div>

                    {/* 右侧：L2 + L3 子类 */}
                    <div className="flex-1 overflow-y-auto py-12 px-12 xl:px-16">
                        {activeItem?.children?.length > 0 ? (
                            <div
                                key={activeItem.id}
                                className="animate-in fade-in slide-in-from-right-4 duration-500"
                            >
                                <div className="flex flex-wrap gap-x-20 gap-y-12">
                                    {activeItem.children.map((child: any) => (
                                        <div key={child.id} className="min-w-[180px] max-w-[240px]">
                                            {/* L2 标题 */}
                                            <LocalizedClientLink
                                                href={getMenuHref(child.link_type, child.slug, child.medusaHandle)}
                                                className="block text-[15px] font-bold uppercase tracking-[0.1em] text-gray-900 hover:text-gray-600 transition-colors mb-4"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                {child.title}
                                            </LocalizedClientLink>
                                            {/* L3 */}
                                            {child.children?.length > 0 && (
                                                <SubLinksOverlay items={child.children} depth={2} />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : activeItem ? (
                            /* L1 没有子项 → 直接跳转 */
                            <div className="flex items-center justify-center h-full text-gray-300 text-sm uppercase tracking-[0.2em]">
                                Select a category to explore
                            </div>
                        ) : null}

                        {/* ── 底部偏好 ── */}
                        <div className="mt-20 pt-10 border-t border-gray-100">
                            <div className="flex items-center gap-x-2 mb-6 text-gray-400">
                                <Globe size={16} strokeWidth={1.5} />
                                <span className="text-[11px] uppercase tracking-[0.2em] font-bold">Preferences</span>
                            </div>
                            <div className="flex flex-wrap gap-x-10 gap-y-4">
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] mb-2">Shipping to</p>
                                    <p className="text-sm font-semibold text-gray-900 uppercase tracking-[0.05em]">{currentCountry}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] mb-2">Language</p>
                                    <p className="text-sm font-semibold text-gray-900 uppercase tracking-[0.05em]">{currentLang}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Mobile: 手风琴 ── */}
                <div className="lg:hidden h-[calc(100%-64px)] overflow-y-auto px-5 py-6">
                    <nav className="flex flex-col">
                        {menuTree?.map((item) => {
                            const isOpenL1 = activeL1 === item.id
                            const hasKids = item.children?.length > 0
                            return (
                                <div key={item.id} className="border-b border-gray-100 last:border-0">
                                    <div className="flex items-center">
                                        <LocalizedClientLink
                                            href={getMenuHref(item.link_type, item.slug, item.medusaHandle)}
                                            className="flex-1 py-5 text-base font-bold uppercase tracking-[0.1em] text-gray-900"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            {item.title}
                                        </LocalizedClientLink>
                                        {hasKids && (
                                            <button
                                                onClick={() => setActiveL1(isOpenL1 ? null : item.id)}
                                                className="w-10 h-10 flex items-center justify-center"
                                            >
                                                <ChevronRight
                                                    size={16}
                                                    className={`transition-transform duration-300 ${
                                                        isOpenL1 ? "rotate-90 text-gray-900" : "text-gray-300"
                                                    }`}
                                                />
                                            </button>
                                        )}
                                    </div>
                                    {hasKids && (
                                        <div
                                            className={`overflow-hidden transition-all duration-[400ms] ease-[cubic-bezier(0.25,1,0.5,1)] ${
                                                isOpenL1 ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                                            }`}
                                        >
                                            <div className="ml-2 pl-4 border-l-2 border-gray-200 pb-4">
                                                {item.children.map((child: any) => (
                                                    <div key={child.id}>
                                                        <LocalizedClientLink
                                                            href={getMenuHref(child.link_type, child.slug, child.medusaHandle)}
                                                            className="block py-3 text-sm font-semibold uppercase tracking-[0.06em] text-gray-700"
                                                            onClick={() => setIsOpen(false)}
                                                        >
                                                            {child.title}
                                                        </LocalizedClientLink>
                                                        {child.children?.length > 0 && (
                                                            <SubLinksOverlay items={child.children} depth={2} />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </nav>

                    {/* Mobile 偏好 */}
                    <div className="mt-10 pt-8 border-t border-gray-100">
                        <div className="flex items-center gap-x-2 mb-5 text-gray-400">
                            <Globe size={16} strokeWidth={1.5} />
                            <span className="text-[11px] uppercase tracking-[0.2em] font-bold">Preferences</span>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] mb-1">Shipping to</p>
                                <p className="text-sm font-semibold text-gray-900 uppercase tracking-[0.05em]">{currentCountry}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] mb-1">Language</p>
                                <p className="text-sm font-semibold text-gray-900 uppercase tracking-[0.05em]">{currentLang}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
