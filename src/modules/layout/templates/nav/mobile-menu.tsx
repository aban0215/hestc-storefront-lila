"use client"

import { useState, useEffect } from "react"
import { Menu, X, ChevronRight } from "lucide-react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { usePathname } from "next/navigation"

// 统一路径处理函数，与 PC 端逻辑对齐
const getMenuHref = (linkType: string, slug: string) => {
    if (!slug) return "/"
    // 清洗 slug：去空格、转小写、空格转中划线、移除首部斜杠
    const cleanSlug = slug.trim().toLowerCase().replace(/\s+/g, "-").replace(/^\//, "")

    switch (linkType) {
        case "category": return `/categories/${cleanSlug}`
        case "collection": return `/collections/${cleanSlug}`
        case "blog": return `/blog`
        default: return `/${cleanSlug}`
    }
}

export default function MobileMenu({ menuTree, brandData }: { menuTree: any[], brandData: any }) {
    const [isOpen, setIsOpen] = useState(false)
    const [openSubMenu, setOpenSubMenu] = useState<number | string | null>(null)
    const [isMounted, setIsMounted] = useState(false)
    const pathname = usePathname()

    // 挂载逻辑
    useEffect(() => {
        setIsMounted(true)
    }, [])

    // 路由变化时自动关闭菜单
    useEffect(() => {
        setIsOpen(false)
        setOpenSubMenu(null)
    }, [pathname])

    // 锁定背景滚动
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => { document.body.style.overflow = 'unset' }
    }, [isOpen])

    if (!isMounted) {
        return <button className="p-2 -ml-2 text-gray-800"><Menu size={24} strokeWidth={1.5} /></button>
    }

    return (
        <>
            {/* 汉堡按钮 */}
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 -ml-2 text-gray-800 relative z-30"
                aria-label="Open Menu"
            >
                <Menu size={24} strokeWidth={1.5} />
            </button>

            {/* 背景遮罩 */}
            <div
                className={`fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
                onClick={() => setIsOpen(false)}
            />

            {/* 侧边抽屉容器 */}
            <div className={`fixed inset-y-0 left-0 z-[10000] w-[85%] max-w-[320px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
                isOpen ? "translate-x-0" : "-translate-x-full"
            }`}>

                {/* 容器使用 h-[100dvh] 确保全屏高度 */}
                <div className="flex flex-col h-[100dvh] bg-white overflow-hidden overscroll-none">

                    {/* Header - 固定高度 */}
                    <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 flex-shrink-0 bg-white">
                        <span className="text-[14px] font-bold tracking-[0.2em] uppercase text-gray-900">
                            {brandData?.sitename || "MENU"}
                        </span>
                        <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-black p-1">
                            <X size={24} />
                        </button>
                    </div>

                    {/* 菜单滚动区 */}
                    <div className="flex-1 overflow-y-auto px-4 py-6 bg-white custom-scrollbar">
                        {menuTree?.map((item: any) => {
                            const hasChildren = item.children && item.children.length > 0;
                            const isSubOpen = openSubMenu === item.id;
                            const mainHref = getMenuHref(item.link_type, item.slug);

                            return (
                                <div key={item.id} className="mb-2 border-b border-gray-50 last:border-0">
                                    <div className="flex items-center justify-between">
                                        <LocalizedClientLink
                                            href={mainHref}
                                            className="flex-1 px-2 py-4 text-[13px] font-bold tracking-[0.15em] uppercase text-black"
                                        >
                                            {item.title}
                                        </LocalizedClientLink>

                                        {hasChildren && (
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setOpenSubMenu(isSubOpen ? null : item.id);
                                                }}
                                                className="w-14 h-14 flex items-center justify-center"
                                            >
                                                <ChevronRight
                                                    size={20}
                                                    className={`transition-transform duration-300 ${isSubOpen ? 'rotate-90 text-pink-600' : 'text-gray-400'}`}
                                                />
                                            </button>
                                        )}
                                    </div>

                                    {/* 子菜单 */}
                                    {hasChildren && (
                                        <div
                                            className={`overflow-hidden transition-all duration-300 ease-in-out bg-gray-50/50 rounded-lg ${
                                                isSubOpen ? "max-h-[800px] mb-4 opacity-100 py-2" : "max-h-0 opacity-0"
                                            }`}
                                        >
                                            {item.children.map((child: any) => (
                                                <LocalizedClientLink
                                                    key={child.id}
                                                    href={getMenuHref(child.link_type, child.slug)}
                                                    className="block px-8 py-3 text-[11px] tracking-[0.1em] text-gray-600 uppercase border-b border-white last:border-0 hover:text-pink-600 active:text-pink-600"
                                                >
                                                    {child.title}
                                                </LocalizedClientLink>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer - 版权信息 */}
                    <div className="p-6 border-t border-gray-50 flex-shrink-0 bg-white">
                        <div className="text-[10px] text-gray-400 uppercase tracking-widest text-center">
                            © {new Date().getFullYear()} {brandData?.sitename || "Lila Zen"}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}