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
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    // 防抖处理：避免鼠标划过瞬间触发
    const handleMouseEnter = (id: number, hasChildren: boolean) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        if (hasChildren) {
            setActiveId(id)
        } else {
            setActiveId(null)
        }
    }

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setActiveId(null)
        }, 150) // 给用户 150ms 的缓冲时间移入下拉框
    }

    return (
        <nav
            className="hidden lg:flex relative items-center justify-center h-[50px] border-t border-gray-100 bg-white"
            onMouseLeave={handleMouseLeave}
        >
            {/* 一级导航 */}
            <ul className="flex items-center gap-x-10 h-full">
                {menuTree?.map((item) => (
                    <li
                        key={item.id}
                        className="flex items-center h-full"
                        onMouseEnter={() => handleMouseEnter(item.id, item.children?.length > 0)}
                    >
                        <LocalizedClientLink
                            href={getMenuHref(item.link_type, item.slug)}
                            className={`relative py-1 text-[11px] tracking-[0.2em] font-bold uppercase transition-colors ${
                                activeId === item.id ? 'text-pink-600' : 'text-gray-700 hover:text-pink-600'
                            }`}
                        >
                            {item.title}
                            {/* 指示器优化：只有激活且有子类时显示 */}
                            <span className={`absolute -bottom-[19px] left-0 h-[2px] bg-pink-600 transition-all duration-300 ${
                                activeId === item.id ? 'w-full' : 'w-0'
                            }`} />
                        </LocalizedClientLink>
                    </li>
                ))}
            </ul>

            {/* 二级/三级 Mega Menu 面板 */}
            <div
                className={`fixed left-0 right-0 w-full bg-white shadow-2xl transition-all duration-300 ease-out z-[120] border-b border-gray-100 ${
                    activeId ? "translate-y-0 opacity-100 visible" : "-translate-y-2 opacity-0 invisible"
                }`}
                style={{ top: "140px", maxHeight: 'calc(100vh - 140px)', overflowY: 'auto' }}
                onMouseEnter={() => {
                    if (timeoutRef.current) clearTimeout(timeoutRef.current)
                }}
            >
                <div className="max-w-[1440px] mx-auto py-10 px-12">
                    {menuTree?.map((item) => (
                        <div
                            key={item.id}
                            className={`${activeId === item.id ? "flex flex-wrap gap-x-16 gap-y-10" : "hidden"}`}
                        >
                            {item.children?.map((child: any) => (
                                <div key={child.id} className="min-w-[180px] max-w-[240px]">
                                    {/* 二级标题：加粗、带点缀 */}
                                    <LocalizedClientLink
                                        href={getMenuHref(child.link_type, child.slug)}
                                        className="inline-block text-[12px] tracking-[0.15em] text-gray-900 font-black uppercase mb-5 hover:text-pink-600 border-b-2 border-transparent hover:border-pink-600 transition-all"
                                        onClick={() => setActiveId(null)}
                                    >
                                        {child.title}
                                    </LocalizedClientLink>

                                    {/* 三级列表：更精致的排版 */}
                                    <ul className="space-y-3">
                                        {child.children?.length > 0 ? (
                                            child.children.map((grandChild: any) => (
                                                <li key={grandChild.id}>
                                                    <LocalizedClientLink
                                                        href={getMenuHref(grandChild.link_type, grandChild.slug)}
                                                        className="text-[11px] tracking-[0.1em] text-gray-500 hover:text-pink-600 transition-colors block leading-relaxed group flex items-center"
                                                        onClick={() => setActiveId(null)}
                                                    >
                                                        <span className="w-0 group-hover:w-2 h-[1px] bg-pink-400 mr-0 group-hover:mr-2 transition-all"></span>
                                                        {grandChild.title}
                                                    </LocalizedClientLink>
                                                </li>
                                            ))
                                        ) : (
                                            <li>
                                                <LocalizedClientLink
                                                    href={getMenuHref(child.link_type, child.slug)}
                                                    className="text-[10px] tracking-[0.1em] text-gray-400 hover:text-gray-900 transition-colors italic"
                                                    onClick={() => setActiveId(null)}
                                                >
                                                    Explore All
                                                </LocalizedClientLink>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* 背景遮罩 */}
            {activeId && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-[110] transition-opacity duration-300"
                    style={{ top: "140px" }}
                />
            )}
        </nav>
    )
}