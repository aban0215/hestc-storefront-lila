"use client"

import { useState, useEffect } from "react"
import { Menu, X, ChevronRight, Globe } from "lucide-react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { usePathname } from "next/navigation"
import HeaderCountrySelect from "@modules/layout/components/header-country-select"
import HeaderLanguageSelect from "@modules/layout/components/header-language-select"

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
                                       currentLocale
                                   }: {
    menuTree: any[],
    brandData: any,
    regions: any,
    locales: any,
    currentLocale: string
}) {
    const [isOpen, setIsOpen] = useState(false)
    const [openSubMenu, setOpenSubMenu] = useState<number | string | null>(null)
    const [isMounted, setIsMounted] = useState(false)
    const pathname = usePathname()

    useEffect(() => { setIsMounted(true) }, [])
    useEffect(() => { setIsOpen(false); setOpenSubMenu(null); }, [pathname])

    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden'
        else document.body.style.overflow = 'unset'
        return () => { document.body.style.overflow = 'unset' }
    }, [isOpen])

    if (!isMounted) return <button className="p-2 -ml-2 text-gray-800"><Menu size={24} strokeWidth={1.5} /></button>

    return (
        <>
            <button onClick={() => setIsOpen(true)} className="p-2 -ml-2 text-gray-800 relative z-30">
                <Menu size={24} strokeWidth={1.5} />
            </button>

            <div className={`fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} onClick={() => setIsOpen(false)} />

            <div className={`fixed inset-y-0 left-0 z-[10000] w-[75%] max-w-[280px] bg-white shadow-2xl transform transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>

                <div className="flex flex-col h-[100dvh] bg-white overflow-hidden overscroll-none">
                    {/* Drawer Header */}
                    <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 flex-shrink-0 bg-white">
                        <span className="text-[12px] font-bold tracking-[0.2em] uppercase text-gray-900">{brandData?.sitename || "MENU"}</span>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 p-1"><X size={20} /></button>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex-1 overflow-y-auto px-4 py-4 bg-white custom-scrollbar">
                        {menuTree?.map((item: any) => {
                            const hasChildren = item.children && item.children.length > 0;
                            const isSubOpen = openSubMenu === item.id;
                            return (
                                <div key={item.id} className="border-b border-gray-50 last:border-0">
                                    <div className="flex items-center justify-between">
                                        <LocalizedClientLink href={getMenuHref(item.link_type, item.slug)} className="flex-1 px-2 py-4 text-[12px] font-bold tracking-widest uppercase text-gray-800">
                                            {item.title}
                                        </LocalizedClientLink>
                                        {hasChildren && (
                                            <button onClick={() => setOpenSubMenu(isSubOpen ? null : item.id)} className="w-12 h-12 flex items-center justify-center">
                                                <ChevronRight size={16} className={`transition-transform duration-300 ${isSubOpen ? 'rotate-90 text-pink-600' : 'text-gray-300'}`} />
                                            </button>
                                        )}
                                    </div>
                                    {hasChildren && (
                                        <div className={`overflow-hidden transition-all duration-300 ease-in-out bg-gray-50/50 ${isSubOpen ? "max-h-[800px] mb-2 opacity-100" : "max-h-0 opacity-0"}`}>
                                            {item.children.map((child: any) => (
                                                <LocalizedClientLink key={child.id} href={getMenuHref(child.link_type, child.slug)} className="block px-6 py-3 text-[10px] tracking-widest text-gray-500 uppercase">
                                                    {child.title}
                                                </LocalizedClientLink>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Preferences Footer */}
                    <div className="p-5 bg-gray-50/80 border-t border-gray-100 flex-shrink-0 max-h-[40vh] overflow-y-auto custom-scrollbar">
                        <div className="flex items-center gap-x-2 mb-4 text-gray-500 px-1">
                            <Globe size={13} strokeWidth={2} />
                            <span className="text-[10px] uppercase tracking-[0.15em] font-bold">Preferences</span>
                        </div>

                        <div className="space-y-2 mobile-preference-container">
                            {/* 国家选择 */}
                            <div className="relative bg-white rounded-xl shadow-sm border border-gray-200/50 min-h-[48px] flex items-center">
                                <HeaderCountrySelect regions={regions} />
                            </div>
                            {/* 语言选择 */}
                            <div className="relative bg-white rounded-xl shadow-sm border border-gray-200/50 min-h-[48px] flex items-center">
                                <HeaderLanguageSelect locales={locales} currentLocale={currentLocale} />
                            </div>
                        </div>

                        <div className="mt-8 text-[9px] text-gray-300 uppercase tracking-[0.2em] text-center">
                            © {new Date().getFullYear()} {brandData?.sitename}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
    /* 1. 统一 Preferences 区域滚动条样式 */
    .custom-scrollbar::-webkit-scrollbar {
        width: 3px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background-color: #e5e7eb;
        border-radius: 10px;
    }

    /* 2. 统一按钮基础样式：确保文字、国旗对齐 */
    .mobile-preference-container button {
        width: 100% !important;
        height: 48px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: flex-start !important;
        padding: 0 16px !important;
        background: transparent !important;
        border: none !important;
        font-size: 11px !important;
        font-weight: 600 !important;
        color: #1f2937 !important;
        text-transform: uppercase !important;
    }

    /* 3. 核心：强制 Popover 面板 100% 宽度对齐 */
    /* 我们需要覆盖 Headless UI 自动生成的样式 */
    .mobile-preference-container div[id^="headlessui-popover-panel"] {
        position: relative !important; /* 改为相对定位，让它撑开父容器并触发 footer 滚动条 */
        top: 0 !important;
        left: 0 !important;
        /* 关键：强制 100% 宽度并取消任何偏移 */
        width: 100% !important; 
        min-width: 100% !important;
        margin-top: 4px !important;
        margin-bottom: 8px !important;
        transform: none !important;
        z-index: 100 !important;
        /* 视觉优化 */
        background-color: #f9fafb !important; /* 浅灰色背景与白色卡片区分 */
        border-radius: 8px !important;
        box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05) !important;
        border: 1px solid #f3f4f6 !important;
        max-height: 250px !important; 
        overflow-y: auto !important;
        -webkit-overflow-scrolling: touch;
    }

    /* 4. 强制面板内的按钮也 100% 铺满，确保点击区域一致 */
    .mobile-preference-container div[id^="headlessui-popover-panel"] button {
        width: 100% !important;
        padding: 12px 16px !important;
        border-bottom: 1px solid #f3f4f6 !important;
    }
    .mobile-preference-container div[id^="headlessui-popover-panel"] button:last-child {
        border-bottom: none !important;
    }

    /* 5. 旗帜和图标间距微调 */
    .mobile-preference-container img, 
    .mobile-preference-container .react-country-flag {
        margin-right: 12px !important;
        flex-shrink: 0;
    }

    /* 6. 解决 Headless UI 默认的弹出层宽度限制 */
    .mobile-preference-container [data-headlessui-state="open"] {
        width: 100% !important;
    }
    
    .mobile-preference-container [id^="headlessui-popover-panel"] {
        position: relative !important; /* 改为相对定位，这是修复微信点击的关键 */
        width: 100% !important;
        top: 0 !important;
        margin-top: 5px !important;
        box-shadow: none !important;
        display: block !important; /* 确保微信能渲染出高度 */
        z-index: 10 !important;
    }

    /* 修复微信中按钮点击时的蓝色高亮遮挡问题 */
    .mobile-preference-container button {
        -webkit-tap-highlight-color: transparent;
        outline: none !important;
    }

    /* 针对微信滚动容器的层级修正 */
    .mobile-preference-container {
        isolation: isolate;
        z-index: 1;
    }
`}</style>
        </>
    )
}