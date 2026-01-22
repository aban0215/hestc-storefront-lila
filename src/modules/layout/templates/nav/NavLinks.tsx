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
            {/* 导航条容器：确保这里的对齐方式和下面面板的一致 */}
            <div className="content-container mx-auto flex items-center justify-center h-full">
                <ul className="flex items-center gap-x-10 h-full">
                    {menuTree?.map((item) => (
                        <li
                            key={item.id}
                            className="flex items-center h-full px-2"
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

            {/* 统一的全宽 Mega Menu 面板 */}
            <div
                className={`fixed left-0 right-0 w-full bg-white border-b border-gray-100 shadow-[0_20px_40px_rgba(0,0,0,0.05)] transition-all duration-300 z-[120] overflow-hidden ${
                    activeId && menuTree?.find(i => i.id === activeId)?.children?.length > 0
                        ? "max-h-[600px] opacity-100 visible"
                        : "max-h-0 opacity-0 invisible"
                }`}
                style={{ top: "140px" }}
                onMouseEnter={() => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }}
            >
                {/* 关键点：使用和导航条一样的 content-container
                   如果是二级菜单，它会整齐地排开；如果是三级，则会有垂直层级
                */}
                <div className="content-container mx-auto py-12 px-8">
                    {menuTree?.map((item) => (
                        <div
                            key={item.id}
                            className={`${activeId === item.id ? "flex flex-wrap gap-x-16 gap-y-10" : "hidden"}`}
                        >
                            {item.children?.map((child: any) => (
                                <div key={child.id} className="min-w-[150px] flex flex-col">
                                    {/* 二级标题 */}
                                    <LocalizedClientLink
                                        href={getMenuHref(child.link_type, child.slug)}
                                        className="text-[12px] tracking-[0.15em] text-gray-900 font-bold uppercase mb-4 hover:text-pink-600"
                                        onClick={() => setActiveId(null)}
                                    >
                                        {child.title}
                                    </LocalizedClientLink>

                                    {/* 三级列表：只有当存在三级数据时才渲染容器 */}
                                    {child.children?.length > 0 && (
                                        <div className="flex flex-col gap-y-3 border-l border-gray-100 pl-4 mt-1">
                                            {child.children.map((grand: any) => (
                                                <LocalizedClientLink
                                                    key={grand.id}
                                                    href={getMenuHref(grand.link_type, grand.slug)}
                                                    className="text-[11px] tracking-[0.1em] text-gray-500 hover:text-black uppercase transition-colors"
                                                    onClick={() => setActiveId(null)}
                                                >
                                                    {grand.title}
                                                </LocalizedClientLink>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* 全宽遮罩 */}
            <div
                className={`fixed inset-0 bg-black/5 backdrop-blur-[1px] transition-opacity duration-300 z-[110] pointer-events-none ${
                    activeId && menuTree?.find(i => i.id === activeId)?.children?.length > 0 ? "opacity-100" : "opacity-0"
                }`}
                style={{ top: "140px" }}
            />
        </nav>
    )
}