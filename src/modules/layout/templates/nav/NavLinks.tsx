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
            <ul className="flex items-center gap-x-10 h-full">
                {menuTree?.map((item) => {
                    const hasChildren = item.children?.length > 0
                    // 判断是否包含三级菜单：只要子节点里有一个带 children，就判定为三级结构
                    const isThreeLevel = item.children?.some((child: any) => child.children?.length > 0)

                    return (
                        <li
                            key={item.id}
                            className="flex items-center h-full"
                            onMouseEnter={() => handleMouseEnter(item.id)}
                        >
                            <LocalizedClientLink
                                href={getMenuHref(item.link_type, item.slug)}
                                className={`relative py-1 text-[11px] tracking-[0.2em] font-bold uppercase transition-colors ${
                                    activeId === item.id ? 'text-pink-600' : 'text-gray-700 hover:text-pink-600'
                                }`}
                            >
                                {item.title}
                                <span className={`absolute -bottom-[19px] left-0 h-[2px] bg-pink-600 transition-all duration-300 ${
                                    activeId === item.id && hasChildren ? 'w-full' : 'w-0'
                                }`} />
                            </LocalizedClientLink>

                            {/* 动态下拉逻辑 */}
                            {activeId === item.id && hasChildren && (
                                isThreeLevel ? (
                                    /* 情况 A：三级菜单 - 显示全宽 Mega Menu */
                                    <div
                                        className="fixed left-0 right-0 top-[140px] w-full bg-white border-b border-gray-100 shadow-xl z-[120] animate-in fade-in slide-in-from-top-2 duration-300"
                                        onMouseEnter={() => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }}
                                    >
                                        <div className="max-w-[1440px] mx-auto py-10 px-12 flex flex-wrap gap-x-16 gap-y-10">
                                            {item.children.map((child: any) => (
                                                <div key={child.id} className="min-w-[160px]">
                                                    <LocalizedClientLink
                                                        href={getMenuHref(child.link_type, child.slug)}
                                                        className="block text-[12px] font-black tracking-widest mb-4 hover:text-pink-600 uppercase"
                                                    >
                                                        {child.title}
                                                    </LocalizedClientLink>
                                                    <ul className="space-y-2">
                                                        {child.children?.map((grand: any) => (
                                                            <li key={grand.id}>
                                                                <LocalizedClientLink
                                                                    href={getMenuHref(grand.link_type, grand.slug)}
                                                                    className="text-[11px] text-gray-500 hover:text-pink-600 transition-colors uppercase"
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
                                ) : (
                                    /* 情况 B：二级菜单 - 显示精致窄下拉框 */
                                    <div
                                        className="absolute top-[50px] min-w-[200px] bg-white border border-gray-100 shadow-lg z-[120] py-4 animate-in fade-in slide-in-from-top-1 duration-200"
                                        onMouseEnter={() => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }}
                                    >
                                        <ul className="flex flex-col">
                                            {item.children.map((child: any) => (
                                                <li key={child.id}>
                                                    <LocalizedClientLink
                                                        href={getMenuHref(child.link_type, child.slug)}
                                                        className="block px-6 py-2 text-[11px] text-gray-600 hover:bg-gray-50 hover:text-pink-600 tracking-widest uppercase transition-all"
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

            {/* 只有在三级大菜单打开时才显示背景遮罩 */}
            {activeId && menuTree?.find(i => i.id === activeId)?.children?.some((c: any) => c.children?.length > 0) && (
                <div className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-[110] pointer-events-none top-[140px]" />
            )}
        </nav>
    )
}