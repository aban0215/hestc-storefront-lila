"use client"

import { useState, useEffect } from "react"
import { Menu, X, ChevronRight, Globe } from "lucide-react"
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
                                       isDesktop = false
                                   }: {
    menuTree: any[],
    brandData: any,
    regions: any,
    locales: any,
    currentLocale: string,
    isDesktop?: boolean
}) {
    const [isOpen, setIsOpen] = useState(false)
    const [openSubMenu, setOpenSubMenu] = useState<number | string | null>(null)
    const [openGrandChildMenu, setOpenGrandChildMenu] = useState<number | string | null>(null)
    const [isMounted, setIsMounted] = useState(false)

    const pathname = usePathname()
    const router = useRouter()

    useEffect(() => { setIsMounted(true) }, [])
    useEffect(() => { setIsOpen(false); setOpenSubMenu(null); }, [pathname])

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => { document.body.style.overflow = 'unset' }
    }, [isOpen])

    const handleRegionChange = async (countryCode: string) => {
        try {
            const pathParts = pathname.split("/")
            if (pathParts.length > 1) pathParts.splice(1, 1)
            const restOfPath = pathParts.join("/") || "/"
            await updateRegion(countryCode, restOfPath)
            setIsOpen(false)
        } catch (error) { console.error(error) }
    }

    const handleLocaleChange = async (localeCode: string) => {
        try {
            await updateLocale(localeCode)
            setIsOpen(false)
            router.refresh()
        } catch (error) { console.error(error) }
    }

    if (!isMounted) return <button className="p-2 -ml-2 text-gray-800"><Menu size={24} strokeWidth={1.5} /></button>

    const currentCountryCode = pathname.split("/")[1]
    const currentCountryName = regions?.flatMap((r: any) => r.countries).find((c: any) => c.iso_2 === currentCountryCode)?.display_name || "Select"
    const currentLanguageName = locales?.find((l: any) => l.code === currentLocale)?.name || "English"

    const underlineBase = "relative inline-block after:content-[''] after:absolute after:w-full after:h-[1px] after:bg-current after:bottom-0 after:left-0 after:scale-x-0 after:origin-left after:transition-transform after:duration-300"

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                onMouseEnter={() => { if (isDesktop) setIsOpen(true) }}
                className={`flex items-center text-gray-800 transition-all hover:opacity-70 ${
                    isDesktop ? "gap-x-2 p-0" : "p-2 -ml-2"
                } relative z-30`}
            >
                <Menu size={isDesktop ? 20 : 24} strokeWidth={1.5} />
                {isDesktop && (
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Menu</span>
                )}
            </button>

            {/* 全屏背景遮罩 - 调快了透明度动画 */}
            <div
                className={`fixed inset-0 z-[100000] bg-white transition-opacity duration-300 ${
                    isOpen ? "opacity-100 visible" : "opacity-0 invisible"
                }`}
            />

            {/* 菜单面板 - 改为 w-full 铺满，translate-y 动画更显高级 */}
            <div
                className={`fixed inset-0 z-[100001] w-full bg-white transform transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                    isOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"
                }`}
            >
                <div className="flex flex-col h-full bg-white">
                    {/* Header: 这里的高度建议和 Nav 第一行对齐，视觉更统一 */}
                    <div className="flex justify-between items-center px-6 h-[60px] lg:h-[90px] border-b border-gray-50 flex-shrink-0">
                        <span className="text-[14px] font-bold tracking-[0.3em] uppercase text-gray-900">
                            {brandData?.sitename || "MENU"}
                        </span>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-gray-900 p-2 hover:bg-gray-50 rounded-full transition-colors"
                        >
                            <X size={24} strokeWidth={1.5} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto overscroll-contain bg-white custom-scrollbar pb-20">
                        <div className="px-8 py-8 bg-white">
                            {menuTree?.map((item: any, index) => {
                                const hasChildren = item.children && item.children.length > 0;
                                const isSubOpen = openSubMenu === item.id;

                                return (
                                    <div key={item.id} className="group mb-2">
                                        <div className="flex items-center justify-between border-b border-gray-50">
                                            <LocalizedClientLink
                                                href={getMenuHref(item.link_type, item.slug, item.medusaHandle)}
                                                className="flex-1 py-5 text-[16px] font-medium tracking-[0.15em] uppercase text-gray-900"
                                            >
                                                {item.title}
                                            </LocalizedClientLink>
                                            {hasChildren && (
                                                <button
                                                    onClick={() => {
                                                        setOpenSubMenu(isSubOpen ? null : item.id);
                                                        setOpenGrandChildMenu(null);
                                                    }}
                                                    className="w-12 h-16 flex justify-end items-center"
                                                >
                                                    <ChevronRight size={18} className={`transition-transform duration-300 ${isSubOpen ? 'rotate-90 text-black' : 'text-gray-300'}`} />
                                                </button>
                                            )}
                                        </div>

                                        {hasChildren && (
                                            <div
                                                className={`overflow-hidden transition-all duration-[400ms]`}
                                                style={{
                                                    maxHeight: isSubOpen ? "2000px" : "0px",
                                                    opacity: isSubOpen ? 1 : 0,
                                                    transitionTimingFunction: "cubic-bezier(0.22, 0.61, 0.36, 1)",
                                                }}
                                            >
                                                <div className="ml-4 mt-2 mb-2 border-l-2 border-pink-100 pl-4">
                                                {item.children.map((child: any, ci: number) => {
                                                    const hasGrandChildren = child.children && child.children.length > 0;
                                                    const isGrandOpen = openGrandChildMenu === child.id;

                                                    return (
                                                        <div
                                                            key={child.id}
                                                            className="flex flex-col"
                                                            style={{
                                                                opacity: isSubOpen ? 1 : 0,
                                                                transform: isSubOpen ? "translateX(0)" : "translateX(-8px)",
                                                                transition: "all 350ms cubic-bezier(0.22, 0.61, 0.36, 1)",
                                                                transitionDelay: isSubOpen ? `${ci * 40}ms` : "0ms",
                                                            }}
                                                        >
                                                            <div className="flex items-center justify-between border-b border-gray-50/30">
                                                                <LocalizedClientLink
                                                                    href={getMenuHref(child.link_type, child.slug, child.medusaHandle)}
                                                                    className={`block py-3.5 text-[13px] tracking-widest uppercase transition-colors duration-200 ${
                                                                        isGrandOpen ? "text-pink-600 font-semibold" : "text-gray-600 font-medium hover:text-pink-600"
                                                                    }`}
                                                                >
                                                                    {child.title}
                                                                </LocalizedClientLink>
                                                                {hasGrandChildren && (
                                                                    <button
                                                                        onClick={() => setOpenGrandChildMenu(isGrandOpen ? null : child.id)}
                                                                        className="w-10 h-10 flex justify-end items-center"
                                                                    >
                                                                        <ChevronRight size={14} className={`transition-transform duration-300 ${isGrandOpen ? 'rotate-90 text-pink-500' : 'text-gray-300'}`} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                            {hasGrandChildren && (
                                                                <div
                                                                    className={`overflow-hidden transition-all duration-[350ms] bg-gray-50/50 rounded-lg px-3`}
                                                                    style={{
                                                                        maxHeight: isGrandOpen ? "600px" : "0px",
                                                                        opacity: isGrandOpen ? 1 : 0,
                                                                        marginTop: isGrandOpen ? 4 : 0,
                                                                        marginBottom: isGrandOpen ? 4 : 0,
                                                                        transitionTimingFunction: "cubic-bezier(0.22, 0.61, 0.36, 1)",
                                                                    }}
                                                                >
                                                                    <div className="py-1">
                                                                    {child.children.map((grandChild: any, gi: number) => (
                                                                        <LocalizedClientLink
                                                                            key={grandChild.id}
                                                                            href={getMenuHref(grandChild.link_type, grandChild.slug, grandChild.medusaHandle)}
                                                                            className="block py-2.5 text-[11px] tracking-[0.1em] text-gray-400 uppercase hover:text-pink-500 transition-all duration-200"
                                                                            style={{
                                                                                opacity: isGrandOpen ? 1 : 0,
                                                                                transform: isGrandOpen ? "translateX(0)" : "translateX(-6px)",
                                                                                transition: "all 300ms cubic-bezier(0.22, 0.61, 0.36, 1)",
                                                                                transitionDelay: isGrandOpen ? `${gi * 40}ms` : "0ms",
                                                                            }}
                                                                        >
                                                                            {grandChild.title}
                                                                        </LocalizedClientLink>
                                                                    ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Preferences 区域 - 全屏模式下加大间距 */}
                        <div className="px-8 py-10 bg-white border-t border-gray-100">
                            <div className="flex items-center gap-x-3 mb-8 text-gray-900">
                                <Globe size={18} strokeWidth={1.5} />
                                <span className="text-[12px] uppercase tracking-[0.2em] font-bold">Preferences</span>
                            </div>

                            <div className="grid grid-cols-1 gap-y-4">
                                <button
                                    onClick={() => setOpenSubMenu(openSubMenu === 'country-list' ? null : 'country-list')}
                                    className="flex items-center justify-between py-4 border-b border-gray-50"
                                >
                                    <span className="text-[12px] font-medium tracking-widest uppercase text-gray-900">Shipping To</span>
                                    <div className="flex items-center gap-x-2">
                                        <span className="text-[11px] text-gray-500 uppercase">{currentCountryName}</span>
                                        <ChevronRight size={16} className={`transition-transform duration-300 ${openSubMenu === 'country-list' ? 'rotate-90' : ''}`} />
                                    </div>
                                </button>

                                <div className={`overflow-hidden transition-all duration-300 ${openSubMenu === 'country-list' ? "max-h-[40vh] opacity-100 overflow-y-auto custom-scrollbar bg-gray-50 rounded-xl px-4" : "max-h-0 opacity-0"}`}>
                                    {regions?.flatMap((r: any) => r.countries).sort((a: any, b: any) => a.display_name.localeCompare(b.display_name)).map((c: any) => (
                                        <button
                                            key={c.iso_2}
                                            onClick={() => handleRegionChange(c.iso_2)}
                                            className={`w-full text-left py-4 text-[11px] uppercase tracking-[0.1em] border-b border-white last:border-0 ${c.iso_2 === currentCountryCode ? "text-black font-bold" : "text-gray-500"}`}
                                        >
                                            {c.display_name}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setOpenSubMenu(openSubMenu === 'lang-list' ? null : 'lang-list')}
                                    className="flex items-center justify-between py-4 border-b border-gray-50"
                                >
                                    <span className="text-[12px] font-medium tracking-widest uppercase text-gray-900">Language</span>
                                    <div className="flex items-center gap-x-2">
                                        <span className="text-[11px] text-gray-500 uppercase">{currentLanguageName}</span>
                                        <ChevronRight size={16} className={`transition-transform duration-300 ${openSubMenu === 'lang-list' ? 'rotate-90' : ''}`} />
                                    </div>
                                </button>

                                <div className={`overflow-hidden transition-all duration-300 ${openSubMenu === 'lang-list' ? "max-h-[40vh] opacity-100 overflow-y-auto custom-scrollbar bg-gray-50 rounded-xl px-4" : "max-h-0 opacity-0"}`}>
                                    {locales?.map((l: any) => (
                                        <button
                                            key={l.code}
                                            onClick={() => handleLocaleChange(l.code)}
                                            className={`w-full text-left py-4 text-[11px] uppercase tracking-[0.1em] border-b border-white last:border-0 ${l.code === currentLocale ? "text-black font-bold" : "text-gray-500"}`}
                                        >
                                            {l.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-20 text-[10px] text-gray-300 uppercase tracking-[0.4em] text-center">
                                © {new Date().getFullYear()} {brandData?.sitename}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 0px; }
                .custom-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </>
    )
}