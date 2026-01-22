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
            className="hidden lg:flex relative h-[50px] border-t border-gray-100 bg-white"
            onMouseLeave={handleMouseLeave}
        >
            {/* 导航条容器：对齐关键点在于 justify-start */}
            <div className="content-container mx-auto flex items-center justify-start h-full">
                <ul className="flex items-center gap-x-12 h-full">
                    {menuTree?.map((item) => (
                        <li
                            key={item.id}
                            className="flex items-center h-full"
                            onMouseEnter={() => handleMouseEnter(item.id)}
                        >
                            <LocalizedClientLink
                                href={getMenuHref(item.link_type, item.slug)}
                                className={`relative py-1 text-[11px] tracking-[0.2em] font-bold uppercase transition-colors ${
                                    activeId === item.id ? 'text-pink-600' : 'text-gray-700'
                                }`}
                            >
                                {item.title}
                                <span className={`absolute -bottom-[19px] left-0 h-[2px] bg-pink-600 transition-all duration-300 ${
                                    activeId === item.id && item.children?.length > 0 ? 'w-full' : 'w-0'
                                }`} />
                            </LocalizedClientLink>
                        </li>
                    ))}
                </ul>
            </div>

            {/* 下拉面板：背景铺满全宽 */}
            <div
                className={`fixed left-0 right-0 w-full bg-white border-b border-gray-100 shadow-[0_30px_50px_rgba(0,0,0,0.08)] transition-all duration-300 ease-in-out z-[120] overflow-hidden ${
                    activeId && menuTree?.find(i => i.id === activeId)?.children?.length > 0
                        ? "max-h-[600px] opacity-100 visible"
                        : "max-h-0 opacity-0 invisible"
                }`}
                style={{ top: "140px" }}
                onMouseEnter={() => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }}
            >
                {/* 下拉内容容器：和上面导航条的对齐逻辑完全一致 */}
                <div className="content-container mx-auto py-10">
                    {menuTree?.map((item) => {
                        const isThreeLevel = item.children?.some((child: any) => child.children?.length > 0)

                        return (
                            <div
                                key={item.id}
                                className={`${activeId === item.id ? "block" : "hidden"}`}
                            >
                                {isThreeLevel ? (
                                    /* 三级菜单布局：横向分列排布 */
                                    <div className="flex flex-wrap gap-x-20 gap-y-10">
                                        {item.children.map((child: any) => (
                                            <div key={child.id} className="min-w-[160px]">
                                                <LocalizedClientLink
                                                    href={getMenuHref(child.link_type, child.slug)}
                                                    className="block text-[12px] font-black tracking-widest mb-5 hover:text-pink-600 uppercase"
                                                >
                                                    {child.title}
                                                </LocalizedClientLink>
                                                <ul className="space-y-3">
                                                    {child.children?.map((grand: any) => (
                                                        <li key={grand.id}>
                                                            <LocalizedClientLink
                                                                href={getMenuHref(grand.link_type, grand.slug)}
                                                                className="text-[11px] text-gray-400 hover:text-pink-600 transition-colors uppercase"
                                                            >
                                                                {grand.title}
                                                            </LocalizedClientLink>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    /* 只有二级菜单布局：垂直列表排列，且依然靠左对齐 */
                                    <div className="flex flex-col space-y-4 max-w-[200px]">
                                        {item.children?.map((child: any) => (
                                            <LocalizedClientLink
                                                key={child.id}
                                                href={getMenuHref(child.link_type, child.slug)}
                                                className="text-[12px] tracking-[0.2em] font-bold text-gray-800 hover:text-pink-600 uppercase transition-all"
                                            >
                                                {child.title}
                                            </LocalizedClientLink>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* 背景遮罩层 */}
            {activeId && (
                <div
                    className="fixed inset-0 bg-black/5 backdrop-blur-[1px] z-[110] transition-opacity duration-300 pointer-events-none"
                    style={{ top: "140px" }}
                />
            )}
        </nav>
    )
}