"use client"

import { useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

// 在这里定义链接跳转逻辑，或者从外部工具类 import 进来
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
            className="relative flex items-center justify-center h-[50px] border-t border-gray-50/80"
            onMouseLeave={() => setActiveId(null)}
        >
            <div className="hidden lg:flex items-center gap-x-12">
                {menuTree.map((item) => (
                    <div
                        key={item.id}
                        className="flex items-center h-[50px] px-2 text-[11px] tracking-[0.25em] font-bold uppercase cursor-pointer"
                        onMouseEnter={() => setActiveId(item.children?.length > 0 ? item.id : null)}
                    >
                        <LocalizedClientLink
                            href={getMenuHref(item.link_type, item.slug)}
                            className="relative py-1 text-gray-800"
                        >
                            {item.title}
                            <span className={`absolute bottom-0 left-0 h-[2px] bg-pink-600 transition-all duration-300 ${activeId === item.id ? 'w-full' : 'w-0'}`} />
                        </LocalizedClientLink>
                    </div>
                ))}
            </div>

            {/* 滑出面板部分 */}
            <div
                className={`absolute top-full bg-white border-b border-gray-100 shadow-xl transition-all duration-500 ease-in-out overflow-hidden z-[120] ${
                    activeId ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
                }`}
                style={{
                    left: "50%",
                    right: "50%",
                    marginLeft: "-50vw",
                    marginRight: "-50vw",
                    width: "100vw"
                }}
            >
                {/* 内部容器依然使用 content-container 确保文字和菜单项与上方导航对齐 */}
                <div className="content-container mx-auto py-10 px-4">
                    {menuTree.map((item) => (
                        <div
                            key={item.id}
                            className={`flex flex-wrap gap-x-16 gap-y-6 justify-center transition-opacity duration-300 ${
                                activeId === item.id ? "flex opacity-100" : "hidden opacity-0"
                            }`}
                        >
                            {/* ... 子菜单项内容保持不变 ... */}
                            {item.children?.map((child: any) => (
                                <LocalizedClientLink
                                    key={child.id}
                                    href={getMenuHref(child.link_type, child.slug)}
                                    className="group flex flex-col items-center min-w-[100px]"
                                    onClick={() => setActiveId(null)}
                                >
                        <span className="text-[10px] tracking-[0.2em] text-gray-500 group-hover:text-pink-600 transition-colors uppercase font-medium">
                            {child.title}
                        </span>
                                    <div className="mt-2 w-0 h-[1px] bg-pink-400 group-hover:w-full transition-all duration-300" />
                                </LocalizedClientLink>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}