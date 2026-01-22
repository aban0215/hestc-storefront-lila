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
            {/* 导航条容器：使用 content-container 确保和内容对齐 */}
            <div className="content-container mx-auto flex items-center justify-center h-full relative">
                <ul className="flex items-center gap-x-10 h-full">
                    {menuTree?.map((item) => {
                        const hasChildren = item.children?.length > 0
                        return (
                            <li
                                key={item.id}
                                className="flex items-center h-full px-2"
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
                            </li>
                        )
                    })}
                </ul>
            </div>

            {/* 统一的白色背景平铺面板 */}
            <div
                className={`fixed left-0 right-0 w-full bg-white border-b border-gray-100 shadow-[0_20px_40px_rgba(0,0,0,0.05)] z-[120] transition-all duration-300 ease-in-out overflow-hidden ${
                    activeId && menuTree?.find(i => i.id === activeId)?.children?.length > 0
                        ? "max-h-[600px] opacity-100 visible"
                        : "max-h-0 opacity-0 invisible"
                }`}
                style={{ top: "140px" }}
                onMouseEnter={() => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }}
            >
                <div className="content-container mx-auto py-10 px-8">
                    {menuTree?.map((item) => {
                        if (activeId !== item.id) return null

                        const isThreeLevel = item.children?.some((child: any) => child.children?.length > 0)

                        return (
                            <div key={item.id} className="animate-in fade-in slide-in-from-top-1 duration-300">
                                {isThreeLevel ? (
                                    /* 情况 A：三级菜单布局 (Mega Menu) */
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
                                ) : (
                                    /* 情况 B：只有二级菜单布局 (垂直平铺) */
                                    /* 这里的 flex-col 保证了菜单往下排，但外层容器保证了背景是全宽的 */
                                    <div className="flex flex-col space-y-5">
                                        {item.children.map((child: any) => (
                                            <LocalizedClientLink
                                                key={child.id}
                                                href={getMenuHref(child.link_type, child.slug)}
                                                className="inline-block w-fit text-[11px] tracking-[0.2em] font-bold text-gray-700 hover:text-pink-600 uppercase transition-all"
                                                onClick={() => setActiveId(null)}
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

            {/* 全宽背景遮罩 */}
            <div
                className={`fixed inset-0 bg-black/5 backdrop-blur-[1px] z-[110] transition-opacity duration-300 pointer-events-none ${
                    activeId && menuTree?.find(i => i.id === activeId)?.children?.length > 0 ? "opacity-100" : "opacity-0"
                }`}
                style={{ top: "140px" }}
            />
        </nav>
    )
}