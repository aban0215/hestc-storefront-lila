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

    return (
        <div
            className="hidden lg:flex relative items-center justify-center h-[50px] border-t border-gray-50/80"
            onMouseLeave={() => setActiveId(null)}
        >
            <div className="flex items-center gap-x-12">
                {menuTree.map((item) => (
                    <div
                        key={item.id}
                        className="flex items-center h-[50px] px-2 cursor-pointer group"
                        onMouseEnter={() => setActiveId(item.children?.length > 0 ? item.id : null)}
                    >
                        <LocalizedClientLink
                            href={getMenuHref(item.link_type, item.slug)}
                            className="relative py-1 text-[11px] tracking-[0.25em] font-bold uppercase text-gray-800 hover:text-pink-600 transition-colors"
                        >
                            {item.title}
                            {/* 悬停下划线：activeId 匹配或容器 Hover 时展现 */}
                            <span className={`absolute -bottom-1 left-0 h-[1.5px] bg-pink-600 transition-all duration-300 ${activeId === item.id ? 'w-full' : 'w-0'}`} />
                        </LocalizedClientLink>
                    </div>
                ))}
            </div>

            {/* 全屏下拉菜单 */}
            <div
                className={`absolute top-full bg-white border-b border-gray-100 shadow-xl transition-all duration-300 ease-in-out overflow-hidden z-[120] ${
                    activeId ? "max-h-[500px] opacity-100 visible" : "max-h-0 opacity-0 invisible"
                }`}
                style={{
                    left: "50%",
                    right: "50%",
                    marginLeft: "-50vw",
                    marginRight: "-50vw",
                    width: "100vw"
                }}
            >
                <div className="content-container mx-auto py-10 px-4">
                    {menuTree.map((item) => (
                        <div
                            key={item.id}
                            className={`flex flex-wrap gap-x-16 gap-y-8 justify-center transition-opacity duration-300 ${
                                activeId === item.id ? "flex opacity-100" : "hidden opacity-0"
                            }`}
                        >
                            {item.children?.map((child: any) => (
                                <LocalizedClientLink
                                    key={child.id}
                                    href={getMenuHref(child.link_type, child.slug)}
                                    className="group flex flex-col items-center min-w-[120px]"
                                    onClick={() => setActiveId(null)}
                                >
                                    <span className="text-[10px] tracking-[0.2em] text-gray-600 group-hover:text-pink-600 transition-colors uppercase font-semibold">
                                        {child.title}
                                    </span>
                                    <div className="mt-2 w-0 h-[1px] bg-pink-400 group-hover:w-full transition-all duration-500" />
                                </LocalizedClientLink>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}