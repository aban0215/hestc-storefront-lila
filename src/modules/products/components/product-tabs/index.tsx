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
            className="hidden lg:flex relative items-center justify-center h-[56px] border-t border-gray-100 bg-white"
            onMouseLeave={handleMouseLeave}
        >
            <ul className="flex items-center gap-x-10 h-full z-[130]">
                {menuTree?.map((item) => (
                    <li
                        key={item.id}
                        className="flex items-center h-full cursor-pointer"
                        onMouseEnter={(e) => handleMouseEnter(item, e)}
                    >
                        <LocalizedClientLink
                            href={getMenuHref(item.link_type, item.slug)}
                            className={`relative py-1 text-[13px] tracking-[0.15em] font-bold uppercase transition-all duration-300 ease-in-out ${
                                activeId === item.id
                                    ? 'text-pink-600'
                                    : 'text-gray-800 hover:text-pink-600'
                            }`}
                        >
                            {item.title}
                        </LocalizedClientLink>
                    </li>
                ))}
            </ul>

            <div
                className={`fixed left-0 right-0 bg-white border-b border-gray-100 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.08)] z-[120] transition-all duration-400 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden ${
                    activeId && activeItem?.children?.length > 0 ? "max-h-[600px] opacity-100 visible" : "max-h-0 opacity-0 invisible"
                }`}
                style={{ top: "140px" }}
                onMouseEnter={() => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }}
            >
                <div
                    className="w-full py-10 transition-all duration-500"
                    style={!isThreeLevel ? { paddingLeft: `${leftOffset}px` } : {}}
                >
                    {isThreeLevel ? (
                        <div className="content-container mx-auto px-8">
                            <div className="flex flex-wrap gap-x-14 gap-y-10">
                                {activeItem?.children.map((child: any) => (
                                    <div key={child.id} className="min-w-[160px]">
                                        <LocalizedClientLink
                                            href={getMenuHref(child.link_type, child.slug)}
                                            className="text-[15px] font-black tracking-widest mb-4 block uppercase hover:text-pink-600 transition-colors"
                                            onClick={() => setActiveId(null)}
                                        >
                                            {child.title}
                                        </LocalizedClientLink>
                                        <div className="flex flex-col gap-y-2.5">
                                            {child.children?.map((grand: any) => (
                                                <LocalizedClientLink
                                                    key={grand.id}
                                                    href={getMenuHref(grand.link_type, grand.slug)}
                                                    className="text-[12px] text-gray-500 hover:text-pink-600 uppercase tracking-wider transition-colors"
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
                        <ul className="flex flex-col space-y-5 px-8">
                            {activeItem?.children.map((child: any) => (
                                <li key={child.id}>
                                    <LocalizedClientLink
                                        href={getMenuHref(child.link_type, child.slug)}
                                        className="text-[13px] tracking-[0.15em] font-bold text-gray-900 hover:text-pink-600 uppercase transition-all inline-block"
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

            <div
                className={`fixed inset-0 bg-black/5 backdrop-blur-[2px] z-[110] pointer-events-none transition-opacity duration-500 ${
                    activeId && activeItem?.children?.length > 0 ? "opacity-100" : "opacity-0"
                }`}
                style={{ top: "140px" }}
            />
        </nav>
    )
}