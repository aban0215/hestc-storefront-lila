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
                                       currentLocale,
                                       isDesktop = false // 接收这个新参数
                                   }: {
    menuTree: any[],
    brandData: any,
    regions: any,
    locales: any,
    currentLocale: string,
    isDesktop?: boolean // 可选参数
}) {
    const [isOpen, setIsOpen] = useState(false)
    const [openSubMenu, setOpenSubMenu] = useState<number | string | null>(null)
    const [openGrandChildMenu, setOpenGrandChildMenu] = useState<number | string | null>(null) // 新加的
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
            <button
                onClick={() => setIsOpen(true)}
                className={`flex items-center text-gray-800 transition-all hover:opacity-70 ${
                    isDesktop ? "gap-x-2 p-0" : "p-2 -ml-2"
                } relative z-30`}
            >
                <Menu size={isDesktop ? 20 : 24} strokeWidth={1.5} />
                {isDesktop && (
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Menu</span>
                )}
            </button>

            {/* 背景遮罩 */}
            <div
                className={`fixed inset-0 z-[99999] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
                onClick={() => setIsOpen(false)}
            />
            {/* 侧边栏容器 */}
            <div
                className={`fixed inset-y-0 left-0 z-[100000] w-[85%] max-w-[320px] bg-white shadow-2xl transform transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                    isOpen ? "translate-x-0" : "-translate-x-full"
                }`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-col h-[100dvh] bg-white">
                    {/* Header - 保持 px-6 */}
                    <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 flex-shrink-0">
                        <span className="text-[12px] font-bold tracking-[0.2em] uppercase text-gray-900">{brandData?.sitename || "MENU"}</span>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 p-1 hover:text-black transition-colors"><X size={20} /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto overscroll-contain bg-white custom-scrollbar">
                        {/* 主导航链接 - 将 px-4 改为 px-6，与 Header 对齐 */}
                        <div className="px-6 py-4 bg-white">
                            {menuTree?.map((item: any) => {
                                const hasChildren = item.children && item.children.length > 0;
                                const isSubOpen = openSubMenu === item.id;

                                return (
                                    <div key={item.id} className="border-b border-gray-50 last:border-0">
                                        {/* 一级菜单 */}
                                        <div className="flex items-center justify-between">
                                            <LocalizedClientLink
                                                href={getMenuHref(item.link_type, item.slug)}
                                                className="flex-1 py-4 text-[12px] font-bold tracking-widest uppercase text-gray-800"
                                            >
                                                {item.title}
                                            </LocalizedClientLink>
                                            {hasChildren && (
                                                <button
                                                    onClick={() => {
                                                        setOpenSubMenu(isSubOpen ? null : item.id);
                                                        setOpenGrandChildMenu(null); // 切换一级时收起所有二级
                                                    }}
                                                    className="w-10 h-12 flex justify-end items-center"
                                                >
                                                    <ChevronRight size={14} className={`transition-transform duration-300 ${isSubOpen ? 'rotate-90 text-pink-600' : 'text-gray-300'}`} />
                                                </button>
                                            )}
                                        </div>

                                        {/* 二级菜单容器 */}
                                        {hasChildren && (
                                            <div className={`overflow-hidden transition-all duration-300 ease-in-out bg-gray-50/30 ${isSubOpen ? "max-h-[2000px] mb-2 opacity-100" : "max-h-0 opacity-0"}`}>
                                                {item.children.map((child: any) => {
                                                    const hasGrandChildren = child.children && child.children.length > 0;
                                                    const isGrandOpen = openGrandChildMenu === child.id;

                                                    return (
                                                        <div key={child.id} className="flex flex-col border-l border-gray-100 ml-2">
                                                            {/* 二级菜单行 */}
                                                            <div className="flex items-center justify-between">
                                                                <LocalizedClientLink
                                                                    href={getMenuHref(child.link_type, child.slug)}
                                                                    className={`block py-3 px-4 text-[10px] tracking-widest uppercase transition-colors ${isGrandOpen ? "text-black font-bold" : "text-gray-600"}`}
                                                                >
                                                                    {child.title}
                                                                </LocalizedClientLink>
                                                                {hasGrandChildren && (
                                                                    <button
                                                                        onClick={() => setOpenGrandChildMenu(isGrandOpen ? null : child.id)}
                                                                        className="w-10 h-10 flex justify-center items-center"
                                                                    >
                                                                        {/* 同样使用 ChevronRight，根据状态旋转 */}
                                                                        <ChevronRight
                                                                            size={12}
                                                                            className={`transition-transform duration-300 ${isGrandOpen ? 'rotate-90 text-pink-600' : 'text-gray-300'}`}
                                                                        />
                                                                    </button>
                                                                )}
                                                            </div>

                                                            {/* 三级菜单容器 */}
                                                            {hasGrandChildren && (
                                                                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isGrandOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}`}>
                                                                    {child.children.map((grandChild: any) => (
                                                                        <LocalizedClientLink
                                                                            key={grandChild.id}
                                                                            href={getMenuHref(grandChild.link_type, grandChild.slug)}
                                                                            className="block py-2.5 px-10 text-[9px] tracking-[0.15em] text-gray-400 uppercase hover:text-black transition-colors"
                                                                        >
                                                                            {grandChild.title}
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

                        {/* 底部 Preferences 模块 - 关键对齐修改 */}
                        <div className="px-6 py-10 bg-gray-50/50 border-t border-gray-100 flex-shrink-0">
                            {/* 标题部分：确保 px 与上方菜单一致 */}
                            <div className="flex items-center gap-x-3 mb-6 text-gray-400">
                                <Globe size={14} strokeWidth={1.5} />
                                <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Preferences</span>
                            </div>

                            {/* 选择框容器：移除 rounded-xl，改为 border 边框 */}
                            <div className="space-y-4 mobile-preference-container">
                                {/* 国家选择 */}
                                <div className="relative bg-white border border-gray-200 flex items-center w-full min-h-[50px] overflow-hidden">
                                    <HeaderCountrySelect regions={regions} />
                                </div>

                                {/* 语言选择 */}
                                <div className="relative bg-white border border-gray-200 flex items-center w-full min-h-[50px] overflow-hidden">
                                    <HeaderLanguageSelect locales={locales} currentLocale={currentLocale} />
                                </div>
                            </div>

                            {/* 版权信息 */}
                            <div className="mt-12 mb-4 text-[9px] text-gray-300 uppercase tracking-[0.3em] text-center">
                                © {new Date().getFullYear()} {brandData?.sitename}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
    /* 统一滚动条 */
    .custom-scrollbar::-webkit-scrollbar {
        width: 3px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background-color: #e5e7eb;
        border-radius: 10px;
    }

    /* 强制 Preferences 内部组件占满全宽 */
    .mobile-preference-container .relative.inline-block {
        display: block !important;
        width: 100% !important;
    }

    /* 统一选择器按钮样式：极致对齐 */
    .mobile-preference-container button {
        width: 100% !important;
        height: 50px !important;
        padding: 0 16px !important; /* 这个值必须与上方菜单文字的起点对齐 */
        margin: 0 !important;
        border-radius: 0 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        background: transparent !important;
        border: none !important;
        font-size: 11px !important;
        font-weight: 700 !important;
        color: #111827 !important;
        text-transform: uppercase !important;
        letter-spacing: 0.15em !important;
        outline: none !important;
    }

    /* 图标对齐 */
    .mobile-preference-container img, 
    .mobile-preference-container .react-country-flag {
        margin-right: 12px !important;
        flex-shrink: 0;
    }

    /* 下拉面板：改为嵌入式，去除悬浮和圆角 */
    .mobile-preference-container div[id^="headlessui-popover-panel"],
    .mobile-preference-container [role="listbox"] {
        position: relative !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important; 
        margin: 0 !important;
        transform: none !important;
        display: block !important;
        background-color: #ffffff !important;
        border-radius: 0 !important;
        border-top: 1px solid #f3f4f6 !important;
        box-shadow: none !important;
        max-height: 300px !important; 
        overflow-y: auto !important;
    }

    /* 下拉选项对齐 */
    .mobile-preference-container div[id^="headlessui-popover-panel"] button {
        padding: 12px 16px !important;
        border-bottom: 1px solid #f9fafb !important;
        justify-content: flex-start !important;
    }

    /* 侧边栏基础边距对齐 */
    .px-6 {
        padding-left: 1.5rem !important; /* 24px */
        padding-right: 1.5rem !important;
    }
`}</style>
        </>
    )
}