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
    const [leftOffset, setLeftOffset] = useState(0)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    const handleMouseEnter = (item: any, e: React.MouseEvent) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        setActiveId(item.id)

        // 计算偏移量保持对齐
        const rect = e.currentTarget.getBoundingClientRect()
        setLeftOffset(rect.left)
    }

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => setActiveId(null), 200)
    }

    const activeItem = menuTree?.find(i => i.id === activeId)
    const isThreeLevel = activeItem?.children?.some((child: any) => child.children?.length > 0)

    return (
        <nav
            className="hidden lg:flex relative items-center justify-center h-[60px] border-t border-gray-100 bg-white" // 大哥建议把导航条高度从 50px 提到 60px，不然大字憋屈
            onMouseLeave={handleMouseLeave}
        >
            {/* 一级导航 */}
            <ul className="flex items-center gap-x-12 h-full z-[130]">
                {menuTree?.map((item) => (
                    <li
                        key={item.id}
                        className="flex items-center h-full cursor-pointer"
                        onMouseEnter={(e) => handleMouseEnter(item, e)}
                    >
                        <LocalizedClientLink
                            href={getMenuHref(item.link_type, item.slug)}
                            className={`relative py-1 text-sm tracking-[0.15em] font-bold uppercase transition-all duration-300 ease-in-out ${
                                activeId === item.id
                                    ? 'text-pink-600 scale-105'
                                    : 'text-gray-800 hover:text-pink-600'
                            }`}
                        >
                            {item.title}
                        </LocalizedClientLink>
                    </li>
                ))}
            </ul>

            {/* 下拉面板 */}
            <div
                className={`fixed left-0 right-0 bg-white border-b border-gray-100 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.08)] z-[120] transition-all duration-400 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden ${
                    activeId && activeItem?.children?.length > 0 ? "max-h-[600px] opacity-100 visible" : "max-h-0 opacity-0 invisible"
                }`}
                style={{ top: "140px" }}
                onMouseEnter={() => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }}
            >
                <div
                    className={`w-full py-12 transition-all duration-500`}
                    style={!isThreeLevel ? { paddingLeft: `${leftOffset}px` } : {}}
                >
                    {isThreeLevel ? (
                        <div className="content-container mx-auto px-8">
                            <div className="flex flex-wrap gap-x-16 gap-y-10">
                                {activeItem?.children.map((child: any) => (
                                    <div key={child.id} className="min-w-[180px]">
                                        <LocalizedClientLink
                                            href={getMenuHref(child.link_type, child.slug)}
                                            className="text-base font-black tracking-widest mb-5 block uppercase hover:text-pink-600 transition-colors"
                                            onClick={() => setActiveId(null)}
                                        >
                                            {child.title}
                                        </LocalizedClientLink>
                                        <div className="flex flex-col gap-y-3">
                                            {child.children?.map((grand: any) => (
                                                <LocalizedClientLink
                                                    key={grand.id}
                                                    href={getMenuHref(grand.link_type, grand.slug)}
                                                    className="text-[13px] text-gray-600 hover:text-pink-600 uppercase tracking-wider transition-colors"
                                                    onClick={() => setActiveId(null)}
                                                >
                                                    {grand.title}
                                                </LocalizedClientLink>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <ul className="flex flex-col space-y-6">
                            {activeItem?.children.map((child: any) => (
                                <li key={child.id}>
                                    <LocalizedClientLink
                                        href={getMenuHref(child.link_type, child.slug)}
                                        className="text-sm tracking-[0.2em] font-bold text-gray-900 hover:text-pink-600 uppercase transition-all inline-block"
                                        onClick={() => setActiveId(null)}
                                    >
                                        {child.title}
                                    </LocalizedClientLink>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
            {/* 遮罩部分保持不变 */}
        </nav>
    )
}