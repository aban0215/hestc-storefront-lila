"use client"

import { useState, useEffect } from "react"
import { Menu, X, ChevronRight, Globe } from "lucide-react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { usePathname, useRouter } from "next/navigation"
import { updateRegion } from "@lib/data/cart"
import { updateLocale } from "@lib/data/locale-actions"

const getMenuHref = (linkType: string, slug: string) => {
    if (!slug) return "/"
    const cleanSlug = slug.trim().toLowerCase().replace(/\s+/g, "-").replace(/^\//, "")
    switch (linkType) {
        case "category": return `/categories/${cleanSlug}`
        case "collection": return `/collections/${cleanSlug}`
        case "blog": return `/blog`
        default: return `/${cleanSlug}`
    }
}

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
        if (isOpen) document.body.style.overflow = 'hidden'
        else document.body.style.overflow = 'unset'
        return () => { document.body.style.overflow = 'unset' }
    }, [isOpen])

    const handleRegionChange = async (countryCode: string) => {
        try {
            await updateRegion(countryCode, pathname)
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

    // 下划线基础类
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

            <div
                className={`fixed inset-0 z-[99999] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
                onClick={() => setIsOpen(false)}
            />

            <div
                className={`fixed inset-y-0 left-0 z-[100000] w-[85%] max-w-[320px] bg-white shadow-2xl transform transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                    isOpen ? "translate-x-0" : "-translate-x-full"
                }`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-col h-[100dvh] bg-white">
                    <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 flex-shrink-0">
                        <span className="text-[12px] font-bold tracking-[0.2em] uppercase text-gray-900">{brandData?.sitename || "MENU"}</span>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 p-1 hover:text-black transition-colors"><X size={20} /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto overscroll-contain bg-white custom-scrollbar">
                        <div className="px-6 py-4 bg-white">
                            {menuTree?.map((item: any) => {
                                const hasChildren = item.children && item.children.length > 0;
                                const isSubOpen = openSubMenu === item.id;

                                return (
                                    <div key={item.id} className="group">
                                        <div className="flex items-center justify-between">
                                            <LocalizedClientLink
                                                href={getMenuHref(item.link_type, item.slug)}
                                                className="flex-1 py-4 text-[12px] font-bold tracking-widest uppercase text-gray-800"
                                            >
                                                <span className={`${underlineBase} pb-1 lg:group-hover:after:scale-x-100`}>
                                                    {item.title}
                                                </span>
                                            </LocalizedClientLink>
                                            {hasChildren && (
                                                <button
                                                    onClick={() => {
                                                        setOpenSubMenu(isSubOpen ? null : item.id);
                                                        setOpenGrandChildMenu(null);
                                                    }}
                                                    /* 重点：默认透明度0，group-hover时变为100 (仅PC端) */
                                                    className={`w-10 h-12 flex justify-end items-center transition-all duration-300 ${isDesktop ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}
                                                >
                                                    <ChevronRight size={14} className={`transition-transform duration-300 ${isSubOpen ? 'rotate-90 text-pink-600' : 'text-gray-300'}`} />
                                                </button>
                                            )}
                                        </div>

                                        {hasChildren && (
                                            <div className={`overflow-hidden transition-all duration-300 ease-in-out bg-gray-50/30 ${isSubOpen ? "max-h-[2000px] mb-2 opacity-100" : "max-h-0 opacity-0"}`}>
                                                {item.children.map((child: any) => {
                                                    const hasGrandChildren = child.children && child.children.length > 0;
                                                    const isGrandOpen = openGrandChildMenu === child.id;

                                                    return (
                                                        <div key={child.id} className="group/sub flex flex-col border-l border-gray-100 ml-2">
                                                            <div className="flex items-center justify-between">
                                                                <LocalizedClientLink
                                                                    href={getMenuHref(child.link_type, child.slug)}
                                                                    className={`block py-3 px-4 text-[10px] tracking-widest uppercase transition-colors ${isGrandOpen ? "text-black font-bold" : "text-gray-600"}`}
                                                                >
                                                                    <span className={`${underlineBase} pb-0.5 lg:group-hover/sub:after:scale-x-100`}>
                                                                        {child.title}
                                                                    </span>
                                                                </LocalizedClientLink>
                                                                {hasGrandChildren && (
                                                                    <button
                                                                        onClick={() => setOpenGrandChildMenu(isGrandOpen ? null : child.id)}
                                                                        className={`w-10 h-10 flex justify-center items-center transition-all duration-300 ${isDesktop ? 'opacity-0 group-hover/sub:opacity-100' : 'opacity-100'}`}
                                                                    >
                                                                        <ChevronRight size={12} className={`transition-transform duration-300 ${isGrandOpen ? 'rotate-90 text-pink-600' : 'text-gray-300'}`} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                            {hasGrandChildren && (
                                                                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isGrandOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}`}>
                                                                    {child.children.map((grandChild: any) => (
                                                                        <LocalizedClientLink
                                                                            key={grandChild.id}
                                                                            href={getMenuHref(grandChild.link_type, grandChild.slug)}
                                                                            className="block py-2.5 px-10 text-[9px] tracking-[0.15em] text-gray-400 uppercase hover:text-black transition-colors group/grand"
                                                                        >
                                                                            <span className={`${underlineBase} lg:group-hover/grand:after:scale-x-100`}>
                                                                                {grandChild.title}
                                                                            </span>
                                                                        </LocalizedClientLink>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Preferences 区域 */}
                        <div className="px-6 py-10 bg-white border-t border-gray-100 flex-shrink-0">
                            <div className="flex items-center gap-x-3 mb-6 text-gray-400">
                                <Globe size={14} strokeWidth={1.5} />
                                <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Preferences</span>
                            </div>

                            <div className="flex flex-col">
                                <div className="border-b border-gray-50">
                                    <button
                                        onClick={() => setOpenSubMenu(openSubMenu === 'country-list' ? null : 'country-list')}
                                        className="w-full flex items-center justify-between py-4"
                                    >
                                        <span className="text-[11px] font-bold tracking-widest uppercase text-gray-800 font-bold underline-offset-4">Shipping To</span>
                                        <div className="flex items-center gap-x-2">
                                            <span className="text-[10px] text-gray-400 uppercase tracking-widest">{currentCountryName}</span>
                                            <ChevronRight size={14} className={`transition-transform duration-300 ${openSubMenu === 'country-list' ? 'rotate-90 text-pink-600' : 'text-gray-300'}`} />
                                        </div>
                                    </button>

                                    <div className={`overflow-hidden transition-all duration-300 ${openSubMenu === 'country-list' ? "max-h-[300px] mb-4 opacity-100 overflow-y-auto custom-scrollbar bg-gray-50/50 rounded-lg" : "max-h-0 opacity-0"}`}>
                                        {regions?.flatMap((r: any) => r.countries).sort((a: any, b: any) => a.display_name.localeCompare(b.display_name)).map((c: any) => (
                                            <button
                                                key={c.iso_2}
                                                onClick={() => handleRegionChange(c.iso_2)}
                                                className={`w-full text-left px-4 py-3 text-[10px] uppercase tracking-[0.15em] border-b border-white last:border-0 ${c.iso_2 === currentCountryCode ? "text-pink-600 font-bold bg-white/50" : "text-gray-500 hover:text-black"}`}
                                            >
                                                {c.display_name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="border-b border-gray-50">
                                    <button
                                        onClick={() => setOpenSubMenu(openSubMenu === 'lang-list' ? null : 'lang-list')}
                                        className="w-full flex items-center justify-between py-4"
                                    >
                                        <span className="text-[11px] font-bold tracking-widest uppercase text-gray-800 font-bold underline-offset-4">Language</span>
                                        <div className="flex items-center gap-x-2">
                                            <span className="text-[10px] text-gray-400 uppercase tracking-widest">{currentLanguageName}</span>
                                            <ChevronRight size={14} className={`transition-transform duration-300 ${openSubMenu === 'lang-list' ? 'rotate-90 text-pink-600' : 'text-gray-300'}`} />
                                        </div>
                                    </button>

                                    <div className={`overflow-hidden transition-all duration-300 ${openSubMenu === 'lang-list' ? "max-h-[300px] mb-4 opacity-100 overflow-y-auto custom-scrollbar bg-gray-50/50 rounded-lg" : "max-h-0 opacity-0"}`}>
                                        {locales?.map((l: any) => (
                                            <button
                                                key={l.code}
                                                onClick={() => handleLocaleChange(l.code)}
                                                className={`w-full text-left px-4 py-3 text-[10px] uppercase tracking-[0.15em] border-b border-white last:border-0 ${l.code === currentLocale ? "text-pink-600 font-bold bg-white/50" : "text-gray-500 hover:text-black"}`}
                                            >
                                                {l.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-16 mb-4 text-[9px] text-gray-300 uppercase tracking-[0.3em] text-center font-medium">
                                © {new Date().getFullYear()} {brandData?.sitename}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 2px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #f3f4f6; border-radius: 10px; }
                .px-6 { padding-left: 1.5rem !important; padding-right: 1.5rem !important; }
            `}</style>
        </>
    )
}