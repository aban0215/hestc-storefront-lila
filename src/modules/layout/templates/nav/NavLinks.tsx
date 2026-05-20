"use client"

import { useState, useRef, useEffect } from "react"
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
    const [menuRect, setMenuRect] = useState<DOMRect | null>(null)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const navRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (navRef.current) {
            setMenuRect(navRef.current.getBoundingClientRect())
        }
    }, [])

    const handleMouseEnter = (item: any, e: React.MouseEvent) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        setActiveId(item.id)
        const rect = e.currentTarget.getBoundingClientRect()
        if (menuRect) {
            setLeftOffset(rect.left - menuRect.left)
        }
    }

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => setActiveId(null), 200)
    }

    const activeItem = menuTree?.find(i => i.id === activeId)
    const isThreeLevel = activeItem?.children?.some((child: any) => child.children?.length > 0)

    return (
        <nav
            ref={navRef}
            className="hidden lg:flex items-center justify-center h-full relative"
            onMouseLeave={handleMouseLeave}
        >
            {/* 一级菜单 - xl 以下缩小间距防止笔记本换行 */}
            <ul className="flex items-center gap-x-4 xl:gap-x-10 h-full">
                {menuTree?.map((item) => (
                    <li
                        key={item.id}
                        className="flex items-center h-full cursor-pointer px-2 xl:px-4"
                        onMouseEnter={(e) => handleMouseEnter(item, e)}
                    >
                        <LocalizedClientLink
                            href={getMenuHref(item.link_type, item.slug)}
                            className={`text-[16px] xl:text-[18px] tracking-[0.06em] uppercase transition-all duration-300 whitespace-nowrap ${
                                activeId === item.id ? 'text-pink-600' : 'text-gray-800 hover:text-pink-600'
                            }`}
                        >
                            {item.title}
                        </LocalizedClientLink>
                    </li>
                ))}
            </ul>

            {/* 下拉面板 */}
            <div
                className={`absolute left-0 bg-white border-b border-gray-100 shadow-xl transition-all duration-500 ease-in-out ${
                    activeId && activeItem?.children?.length > 0
                        ? "opacity-100 visible translate-y-0"
                        : "opacity-0 invisible -translate-y-4"
                }`}
                style={{
                    top: "100%",
                    left: !isThreeLevel ? `${Math.max(0, leftOffset)}px` : "0",
                    width: !isThreeLevel ? "auto" : "100%",
                    minWidth: !isThreeLevel ? "320px" : "100%",  // 👈 字号变大，最小宽度同步增加
                    maxWidth: !isThreeLevel ? "480px" : "1440px",  // 👈 同步增加
                    zIndex: 105
                }}
                onMouseEnter={() => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }}
            >
                <div className="w-full py-12 px-8 bg-white">
                    {isThreeLevel ? (
                        <div className="max-w-[1440px] mx-auto">
                            <div className="flex flex-wrap gap-x-20 gap-y-10">
                                {activeItem?.children.map((child: any) => (
                                    <div key={child.id} className="min-w-[240px]">  {/* 👈 列宽增加 */}
                                        {/* 🔧 三级菜单 - 一级子项：28px + 去加粗 */}
                                        <LocalizedClientLink
                                            href={getMenuHref(child.link_type, child.slug)}
                                            className="text-[16px] tracking-[0.06em] mb-6 block uppercase hover:text-pink-600 transition-colors"  // 👈 移除 font-black，字号×2
                                            onClick={() => setActiveId(null)}
                                        >
                                            {child.title}
                                        </LocalizedClientLink>
                                        <div className="flex flex-col gap-y-6">  {/* 👈 间距增加 */}
                                            {child.children?.map((grand: any) => (
                                                <LocalizedClientLink
                                                    key={grand.id}
                                                    href={getMenuHref(grand.link_type, grand.slug)}
                                                    className="text-[18px] text-gray-500 hover:text-pink-600 uppercase tracking-[0.06em] transition-colors"  // 👈 26px + 去加粗 + tracking 调整
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
                        // 🔧 二级菜单：28px + 去加粗 + 间距调整
                        <ul className="flex flex-col space-y-8 items-start">  {/* 👈 space-y-7 → space-y-8 */}
                            {activeItem?.children.map((child: any) => (
                                <li key={child.id}>
                                    <LocalizedClientLink
                                        href={getMenuHref(child.link_type, child.slug)}
                                        className="text-[16px] tracking-[0.06em] text-gray-900 hover:text-pink-600 uppercase transition-all inline-block"
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

            {/* 遮罩层 */}
            <div
                className={`absolute inset-x-0 bg-black/10 backdrop-blur-[2px] transition-opacity duration-500 ${
                    activeId && activeItem?.children?.length > 0
                        ? "opacity-100"
                        : "opacity-0 pointer-events-none"
                }`}
                style={{
                    top: "100%",
                    height: "calc(100vh - 80px)",
                    zIndex: 40
                }}
            />
        </nav>
    )
}