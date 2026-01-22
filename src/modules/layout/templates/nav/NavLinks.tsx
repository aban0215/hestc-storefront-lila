"use client"

import { useState, useRef } from "react"
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
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    const handleMouseEnter = (id: number) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        setActiveId(id)
    }

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => setActiveId(null), 200)
    }

    return (
        <nav
            className="hidden lg:flex relative items-center justify-center h-[50px] border-t border-gray-100 bg-white"
            onMouseLeave={handleMouseLeave}
        >
            {/* 1. 全宽背景层：只负责显示白底和阴影，不包内容 */}
            <div
                className={`fixed left-0 right-0 bg-white border-b border-gray-100 shadow-[0_20px_40px_rgba(0,0,0,0.05)] transition-all duration-300 ease-in-out z-[110] overflow-hidden ${
                    activeId && menuTree?.find(i => i.id === activeId)?.children?.length > 0
                        ? "max-h-[600px] opacity-100 visible"
                        : "max-h-0 opacity-0 invisible"
                }`}
                style={{ top: "140px" }}
                onMouseEnter={() => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }}
            />

            {/* 2. 导航菜单主体 */}
            <ul className="flex items-center gap-x-10 h-full">
                {menuTree?.map((item) => {
                    const hasChildren = item.children?.length > 0
                    const isThreeLevel = item.children?.some((child: any) => child.children?.length > 0)

                    return (
                        <li
                            key={item.id}
                            className="relative flex items-center h-full" // 注意这里的 relative
                            onMouseEnter={() => handleMouseEnter(item.id)}
                        >
                            <LocalizedClientLink
                                href={getMenuHref(item.link_type, item.slug)}
                                className={`relative py-1 text-[11px] tracking-[0.2em] font-bold uppercase transition-colors z-[130] ${
                                    activeId === item.id ? 'text-pink-600' : 'text-gray-700 hover:text-pink-600'
                                }`}
                            >
                                {item.title}
                                <span className={`absolute -bottom-[19px] left-0 h-[2px] bg-pink-600 transition-all duration-300 ${
                                    activeId === item.id && hasChildren ? 'w-full' : 'w-0'
                                }`} />
                            </LocalizedClientLink>

                            {/* 3. 动态内容层 */}
                            {activeId === item.id && hasChildren && (
                                isThreeLevel ? (
                                    /* 三级菜单：全宽对齐内容容器 (Mega Menu 模式) */
                                    <div
                                        className="fixed left-0 right-0 top-[140px] w-full z-[120] pointer-events-none"
                                        onMouseEnter={() => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }}
                                    >
                                        <div className="content-container mx-auto py-10 px-8 pointer-events-auto">
                                            <div className="flex flex-wrap gap-x-16 gap-y-10">
                                                {item.children.map((child: any) => (
                                                    <div key={child.id} className="min-w-[160px]">
                                                        <LocalizedClientLink
                                                            href={getMenuHref(child.link_type, child.slug)}
                                                            className="block text-[12px] font-black tracking-widest mb-4 hover:text-pink-600 uppercase"
                                                            onClick={() => setActiveId(null)}
                                                        >
                                                            {child.title}
                                                        </LocalizedClientLink>
                                                        <ul className="space-y-2">
                                                            {child.children?.map((grand: any) => (
                                                                <li key={grand.id}>
                                                                    <LocalizedClientLink
                                                                        href={getMenuHref(grand.link_type, grand.slug)}
                                                                        className="text-[11px] text-gray-500 hover:text-pink-600 transition-colors uppercase"
                                                                        onClick={() => setActiveId(null)}
                                                                    >
                                                                        {grand.title}
                                                                    </LocalizedClientLink>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* 二级菜单：精准对齐当前菜单下方 (Drop Down 模式) */
                                    /* 这里的 top-[50px] 对应 nav 的高度，确保它正好贴在下面 */
                                    <div
                                        className="absolute top-[50px] left-0 pt-10 z-[120] min-w-[200px]"
                                        onMouseEnter={() => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }}
                                    >
                                        <ul className="flex flex-col space-y-5">
                                            {item.children.map((child: any) => (
                                                <li key={child.id}>
                                                    <LocalizedClientLink
                                                        href={getMenuHref(child.link_type, child.slug)}
                                                        className="text-[11px] tracking-[0.2em] font-bold text-gray-700 hover:text-pink-600 uppercase transition-all whitespace-nowrap"
                                                        onClick={() => setActiveId(null)}
                                                    >
                                                        {child.title}
                                                    </LocalizedClientLink>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )
                            )}
                        </li>
                    )
                })}
            </ul>

            {/* 背景遮罩 */}
            {activeId && (
                <div className="fixed inset-0 bg-black/5 backdrop-blur-[1px] z-[100] pointer-events-none top-[140px]" />
            )}
        </nav>
    )
}