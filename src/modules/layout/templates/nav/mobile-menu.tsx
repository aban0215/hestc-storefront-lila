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
            {/* 触发按钮 */}
            <button onClick={() => setIsOpen(true)} className="p-2 -ml-2 text-gray-800 relative z-30">
                <Menu size={24} strokeWidth={1.5} />
            </button>

            {/* 背景遮罩 */}
            <div className={`fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} onClick={() => setIsOpen(false)} />

            {/* 侧边栏容器 - 宽度优化为 75% */}
            <div
                className={`fixed inset-y-0 left-0 z-[10000] w-[75%] max-w-[280px] bg-white shadow-2xl transform transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
                onClick={(e) => e.stopPropagation()} // 防止菜单内点击传播到遮罩层
            >
                <div className="flex flex-col h-[100dvh] bg-white overflow-hidden overscroll-none">
                    {/* Header */}
                    <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 flex-shrink-0 bg-white">
                        <span className="text-[12px] font-bold tracking-[0.2em] uppercase text-gray-900">{brandData?.sitename || "MENU"}</span>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 p-1"><X size={20} /></button>
                    </div>

                    {/* 主导航链接 */}
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

                    {/* 底部 Preferences 模块 - 适配微信与 UC */}
                    <div className="p-5 bg-gray-50/80 border-t border-gray-100 flex-shrink-0 max-h-[45vh] overflow-y-auto custom-scrollbar">
                        <div className="flex items-center gap-x-2 mb-4 text-gray-500 px-1">
                            <Globe size={13} strokeWidth={2} />
                            <span className="text-[10px] uppercase tracking-[0.15em] font-bold">Preferences</span>
                        </div>

                        <div className="space-y-2 mobile-preference-container">
                            {/* 国家选择 */}
                            <div className="relative bg-white rounded-xl shadow-sm border border-gray-200/50 min-h-[48px] flex items-center overflow-hidden w-full">
                                <HeaderCountrySelect regions={regions} />
                            </div>
                            {/* 语言选择 */}
                            <div className="relative bg-white rounded-xl shadow-sm border border-gray-200/50 min-h-[48px] flex items-center overflow-hidden w-full">
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
                /* 1. Preferences 区域滚动条 */
                .custom-scrollbar::-webkit-scrollbar {
                    width: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #e5e7eb;
                    border-radius: 10px;
                }

                /* 2. 按钮样式对齐：移除微信默认点击高亮，统一布局 */
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
                    -webkit-tap-highlight-color: transparent !important;
                    outline: none !important;
                }

                /* 3. 核心修复：微信/UC 下拉框对齐与稳定性 */
                /* 将绝对定位改为相对定位，防止被微信拦截，并撑开父容器触发滚动 */
                .mobile-preference-container div[id^="headlessui-popover-panel"],
                .mobile-preference-container [role="listbox"] {
                    position: relative !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100% !important; 
                    min-width: 100% !important;
                    margin-top: 2px !important;
                    transform: none !important;
                    z-index: 10 !important;
                    display: block !important;
                    /* 视觉样式 */
                    background-color: #f9fafb !important;
                    border-radius: 0 0 8px 8px !important;
                    box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.03) !important;
                    border-top: 1px solid #f3f4f6 !important;
                    border-left: none !important;
                    border-right: none !important;
                    border-bottom: none !important;
                    max-height: 250px !important; 
                    overflow-y: auto !important;
                    -webkit-overflow-scrolling: touch;
                }

                /* 4. 下拉选项按钮对齐 */
                .mobile-preference-container div[id^="headlessui-popover-panel"] button {
                    width: 100% !important;
                    height: auto !important;
                    padding: 12px 16px !important;
                    border-bottom: 1px solid #f1f1f1 !important;
                    font-weight: 500 !important;
                }
                .mobile-preference-container div[id^="headlessui-popover-panel"] button:last-child {
                    border-bottom: none !important;
                }

                /* 5. 图标间距 */
                .mobile-preference-container img, 
                .mobile-preference-container .react-country-flag {
                    margin-right: 12px !important;
                    flex-shrink: 0;
                }

                /* 6. 容器层级修正 */
                .mobile-preference-container {
                    isolation: isolate;
                }
            `}</style>
        </>
    )
}