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
    const [leftOffset, setLeftOffset] = useState(0) // 记录当前一级菜单的左偏移
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const navRef = useRef<HTMLDivElement>(null)

    const handleMouseEnter = (id: number, e: React.MouseEvent) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        setActiveId(id)

        // 关键：计算当前鼠标移入的那个 <li> 距离屏幕左侧的距离
        const rect = e.currentTarget.getBoundingClientRect()
        setLeftOffset(rect.left)
    }

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => setActiveId(null), 200)
    }

    const activeItem = menuTree?.find(i => i.id === activeId)
    const hasChildren = activeItem?.children?.length > 0
    const isThreeLevel = activeItem?.children?.some((child: any) => child.children?.length > 0)

    return (
        <nav
            ref={navRef}
            className="hidden lg:flex relative items-center justify-center h-[50px] border-t border-gray-100 bg-white"
            onMouseLeave={handleMouseLeave}
        >
            {/* 一级菜单列表 */}
            <ul className="flex items-center gap-x-10 h-full relative z-[130]">
                {menuTree?.map((item) => (
                    <li
                        key={item.id}
                        className="flex items-center h-full px-2"
                        onMouseEnter={(e) => handleMouseEnter(item.id, e)}
                    >
                        <LocalizedClientLink
                            href={getMenuHref(item.link_type, item.slug)}
                            className={`relative py-1 text-[11px] tracking-[0.2em] font-bold uppercase transition-colors ${
                                activeId === item.id ? 'text-pink-600' : 'text-gray-700 hover:text-pink-600'
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

            {/* 统一内容面板：它包裹在白背景里，能自动撑开高度 */}
            <div
                className={`fixed left-0 right-0 bg-white border-b border-gray-100 shadow-[0_20px_40px_rgba(0,0,0,0.08)] z-[120] transition-all duration-300 ease-in-out overflow-hidden ${
                    activeId && hasChildren ? "max-h-[600px] opacity-100 visible" : "max-h-0 opacity-0 invisible"
                }`}
                style={{ top: "140px" }}
                onMouseEnter={() => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }}
            >
                <div className="w-full">
                    {isThreeLevel ? (
                        /* 三级菜单布局：全宽容器对齐 */
                        <div className="content-container mx-auto py-10 px-8">
                            <div className="flex flex-wrap gap-x-16 gap-y-10">
                                {activeItem?.children.map((child: any) => (
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
                    ) : (
                        /* 二级菜单布局：利用 leftOffset 精准对齐 */
                        <div className="w-full py-8">
                            <div
                                style={{ paddingLeft: `${leftOffset}px` }}
                                className="transition-all duration-300 ease-out"
                            >
                                <ul className="flex flex-col space-y-4">
                                    {activeItem?.children.map((child: any) => (
                                        <li key={child.id}>
                                            <LocalizedClientLink
                                                href={getMenuHref(child.link_type, child.slug)}
                                                className="text-[11px] tracking-[0.2em] font-bold text-gray-700 hover:text-pink-600 uppercase transition-all inline-block"
                                                onClick={() => setActiveId(null)}
                                            >
                                                {child.title}
                                            </LocalizedClientLink>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 黑色半透明遮罩层 */}
            <div
                className={`fixed inset-0 bg-black/5 backdrop-blur-[1px] z-[100] pointer-events-none transition-opacity duration-300 ${
                    activeId && hasChildren ? "opacity-100" : "opacity-0"
                }`}
                style={{ top: "140px" }}
            />
        </nav>
    )
}