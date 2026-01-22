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

        // 【关键点】获取当前一级菜单文字相对于屏幕左侧的距离
        // 使用 e.currentTarget 确保拿到的是 <li> 的位置
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
            className="hidden lg:flex relative items-center justify-center h-[50px] border-t border-gray-100 bg-white"
            onMouseLeave={handleMouseLeave}
        >
            {/* 1. 一级导航：保持居中排列 */}
            <ul className="flex items-center gap-x-12 h-full z-[130]">
                {menuTree?.map((item) => (
                    <li
                        key={item.id}
                        className="flex items-center h-full cursor-pointer"
                        onMouseEnter={(e) => handleMouseEnter(item, e)}
                    >
                        <LocalizedClientLink
                            href={getMenuHref(item.link_type, item.slug)}
                            className={`relative py-1 text-[11px] tracking-[0.2em] font-bold uppercase transition-all duration-300 ${
                                activeId === item.id ? 'text-pink-600' : 'text-gray-800'
                            }`}
                        >
                            {item.title}
                            <span className={`absolute -bottom-[19px] left-0 h-[2px] bg-pink-600 transition-all duration-300 ${
                                activeId === item.id ? 'w-full' : 'w-0'
                            }`} />
                        </LocalizedClientLink>
                    </li>
                ))}
            </ul>

            {/* 2. 下拉全宽背景 & 内容 */}
            <div
                className={`fixed left-0 right-0 bg-white border-b border-gray-100 shadow-[0_20px_40px_rgba(0,0,0,0.05)] z-[120] transition-all duration-300 ease-in-out overflow-hidden ${
                    activeId && activeItem?.children?.length > 0 ? "max-h-[600px] opacity-100 visible" : "max-h-0 opacity-0 invisible"
                }`}
                style={{ top: "140px" }}
                onMouseEnter={() => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }}
            >
                {/* 关键容器：如果是三级菜单，我们居中对齐；
                    如果是二级菜单，我们直接用计算出来的 leftOffset 设置 paddingLeft
                */}
                <div
                    className={`w-full py-12 transition-all duration-500 ease-out`}
                    style={!isThreeLevel ? { paddingLeft: `${leftOffset}px` } : {}}
                >
                    {isThreeLevel ? (
                        /* 三级菜单：依然使用 content-container 居中排列，显得大气 */
                        <div className="content-container mx-auto px-8">
                            <div className="flex flex-wrap gap-x-16 gap-y-10">
                                {activeItem?.children.map((child: any) => (
                                    <div key={child.id} className="min-w-[180px]">
                                        <LocalizedClientLink
                                            href={getMenuHref(child.link_type, child.slug)}
                                            className="text-[12px] font-black tracking-widest mb-4 block uppercase hover:text-pink-600"
                                            onClick={() => setActiveId(null)}
                                        >
                                            {child.title}
                                        </LocalizedClientLink>
                                        <div className="flex flex-col gap-y-3">
                                            {child.children?.map((grand: any) => (
                                                <LocalizedClientLink
                                                    key={grand.id}
                                                    href={getMenuHref(grand.link_type, grand.slug)}
                                                    className="text-[11px] text-gray-500 hover:text-black uppercase tracking-wider"
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
                        /* 二级菜单：精准对齐一级菜单起始位置 */
                        <ul className="flex flex-col space-y-6">
                            {activeItem?.children.map((child: any) => (
                                <li key={child.id}>
                                    <LocalizedClientLink
                                        href={getMenuHref(child.link_type, child.slug)}
                                        className="text-[12px] tracking-[0.2em] font-bold text-gray-900 hover:text-pink-600 uppercase transition-all inline-block"
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

            {/* 3. 背景遮罩 */}
            <div
                className={`fixed inset-0 bg-black/5 backdrop-blur-[2px] z-[110] pointer-events-none transition-opacity duration-500 ${
                    activeId && activeItem?.children?.length > 0 ? "opacity-100" : "opacity-0"
                }`}
                style={{ top: "140px" }}
            />
        </nav>
    )
}