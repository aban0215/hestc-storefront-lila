"use client"

import { useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

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

export default function NavLinks({ menuTree }: { menuTree: any[] }) {
    const [activeId, setActiveId] = useState<number | null>(null)

    return (
        <div
            className="hidden lg:flex relative items-center justify-center h-[50px] border-t border-gray-50/80"
            onMouseLeave={() => setActiveId(null)}
        >
            {/* 主导航列表 */}
            <div className="flex items-center gap-x-12 h-full">
                {menuTree.map((item) => (
                    <div
                        key={item.id}
                        className="flex items-center h-full px-2 cursor-pointer group"
                        onMouseEnter={() => setActiveId(item.children?.length > 0 ? item.id : null)}
                    >
                        <LocalizedClientLink
                            href={getMenuHref(item.link_type, item.slug)}
                            className={`relative py-1 text-[11px] tracking-[0.25em] font-bold uppercase transition-all duration-300 ${
                                activeId === item.id ? 'text-pink-600' : 'text-gray-800'
                            }`}
                        >
                            {item.title}
                            {/* 底部线条指示器 */}
                            <span className={`absolute -bottom-[18px] left-0 h-[2px] bg-pink-600 transition-all duration-300 ${
                                activeId === item.id ? 'w-full opacity-100' : 'w-0 opacity-0'
                            }`} />
                        </LocalizedClientLink>
                    </div>
                ))}
            </div>

            {/* --- 全屏滑出面板 --- */}
            <div
                className={`absolute top-full left-1/2 -translate-x-1/2 w-screen bg-white border-b border-gray-100 shadow-[0_20px_40px_rgba(0,0,0,0.05)] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] z-[120] overflow-hidden ${
                    activeId ? "max-h-[600px] opacity-100 visible" : "max-h-0 opacity-0 invisible"
                }`}
            >
                <div className="content-container mx-auto py-12 px-8">
                    {menuTree.map((item) => (
                        <div
                            key={item.id}
                            className={`grid grid-cols-5 gap-x-12 gap-y-10 transition-all duration-500 ${
                                activeId === item.id ? "translate-y-0 opacity-100 block" : "translate-y-4 opacity-0 hidden"
                            }`}
                        >
                            {item.children?.map((child: any) => (
                                <div key={child.id} className="flex flex-col">
                                    {/* 二级菜单：作为小标题 */}
                                    <LocalizedClientLink
                                        href={getMenuHref(child.link_type, child.slug)}
                                        className="text-[12px] tracking-[0.2em] text-gray-900 uppercase font-bold mb-4 hover:text-pink-600 transition-colors"
                                        onClick={() => setActiveId(null)}
                                    >
                                        {child.title}
                                    </LocalizedClientLink>

                                    {/* 三级菜单：垂直列表 */}
                                    <div className="flex flex-col gap-y-3 border-l border-gray-50 pl-4">
                                        {child.children?.length > 0 ? (
                                            child.children.map((grandChild: any) => (
                                                <LocalizedClientLink
                                                    key={grandChild.id}
                                                    href={getMenuHref(grandChild.link_type, grandChild.slug)}
                                                    className="text-[11px] tracking-[0.15em] text-gray-500 hover:text-black uppercase transition-colors font-medium"
                                                    onClick={() => setActiveId(null)}
                                                >
                                                    {grandChild.title}
                                                </LocalizedClientLink>
                                            ))
                                        ) : (
                                            /* 如果没有三级菜单，可以留空或显示查看全部 */
                                            <LocalizedClientLink
                                                href={getMenuHref(child.link_type, child.slug)}
                                                className="text-[10px] tracking-[0.1em] text-gray-300 hover:text-pink-400 uppercase italic"
                                                onClick={() => setActiveId(null)}
                                            >
                                                View All
                                            </LocalizedClientLink>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>

                {/* 面板底部装饰条 */}
                <div className="h-6 bg-gray-50/50 w-full" />
            </div>

            {/* 遮罩层：当菜单打开时，给页面下方加个半透明蒙层，增加视觉聚焦度 */}
            <div
                className={`fixed inset-0 top-[140px] bg-black/10 backdrop-blur-[2px] transition-opacity duration-500 z-[110] pointer-events-none ${
                    activeId ? "opacity-100" : "opacity-0"
                }`}
            />
        </div>
    )
}