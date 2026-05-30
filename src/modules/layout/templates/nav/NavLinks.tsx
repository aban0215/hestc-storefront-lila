"use client"

import { useState, useRef, useEffect } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getMenuHref } from "@lib/menu-utils"

const EASE = "cubic-bezier(0.22, 0.61, 0.36, 1)"

function DeepMenuItems({ items, level, onClose }: { items: any[]; level: number; onClose: () => void }) {
    return items.map((item, i) => (
        <div key={item.id}>
            <LocalizedClientLink
                href={getMenuHref(item.link_type, item.slug, item.medusaHandle)}
                className="block uppercase tracking-[0.06em] transition-all duration-300 hover:text-pink-600 hover:translate-x-1"
                style={{
                    fontSize: level === 1 ? "14px" : "12px",
                    color: level === 1 ? "#6b7280" : "#9ca3af",
                    fontWeight: level === 1 ? 500 : 400,
                    paddingLeft: level === 1 ? 0 : 12,
                }}
                onClick={onClose}
            >
                {item.title}
            </LocalizedClientLink>
            {item.children?.length > 0 && (
                <div className="flex flex-col gap-y-3 ml-2 mt-2">
                    <DeepMenuItems items={item.children} level={level + 1} onClose={onClose} />
                </div>
            )}
        </div>
    ))
}

export default function NavLinks({ menuTree }: { menuTree: any[] }) {
    const [activeId, setActiveId] = useState<number | null>(null)
    const [visible, setVisible] = useState(false)
    const [dropStyle, setDropStyle] = useState<{ left: string; minWidth?: string }>({ left: "0px" })
    const [menuRect, setMenuRect] = useState<DOMRect | null>(null)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const navRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (navRef.current) setMenuRect(navRef.current.getBoundingClientRect())
    }, [])

    useEffect(() => {
        if (activeId) {
            setVisible(true)
        } else {
            const t = setTimeout(() => setVisible(false), 400)
            return () => clearTimeout(t)
        }
    }, [activeId])

    const handleMouseEnter = (item: any, e: React.MouseEvent) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        setActiveId(item.id)
        if (menuRect) {
            const li = e.currentTarget as HTMLElement
            const liRect = li.getBoundingClientRect()
            const liCenter = liRect.left - menuRect.left + liRect.width / 2
            const hasGrand = item.children?.some((c: any) => c.children?.length > 0)
            if (hasGrand) {
                setDropStyle({ left: "0px" })
            } else {
                // 二级菜单：面板居中于 L1 项下方
                setDropStyle({ left: `${Math.round(liCenter)}px`, minWidth: "200px" })
            }
        }
    }

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => setActiveId(null), 200)
    }

    const activeItem = menuTree?.find(i => i.id === activeId)
    const hasGrandchildren = activeItem?.children?.some((c: any) => c.children?.length > 0)
    const isOpen = activeId && activeItem?.children?.length > 0

    return (
        <nav ref={navRef} className="hidden lg:flex items-center justify-center h-full relative" onMouseLeave={handleMouseLeave}>
            {/* ====== 一级菜单 ====== */}
            <ul className="flex items-center gap-x-6 xl:gap-x-10 h-full">
                {menuTree?.map((item) => {
                    const isActive = activeId === item.id
                    return (
                        <li
                            key={item.id}
                            className="flex items-center h-full cursor-pointer px-2 xl:px-4"
                            onMouseEnter={(e) => handleMouseEnter(item, e)}
                        >
                            <LocalizedClientLink
                                href={getMenuHref(item.link_type, item.slug, item.medusaHandle)}
                                className="relative text-[15px] xl:text-[17px] font-medium tracking-[0.08em] uppercase transition-colors duration-300 whitespace-nowrap"
                                style={{ color: isActive ? "#db2777" : "#1f2937" }}
                            >
                                {item.title}
                                {/* active 下划线向左展开 */}
                                <span
                                    className="absolute -bottom-1 left-0 h-[2px] bg-pink-500 transition-all duration-300 rounded-full"
                                    style={{
                                        width: isActive ? "100%" : "0%",
                                        opacity: isActive ? 1 : 0,
                                        transformOrigin: "left",
                                    }}
                                />
                            </LocalizedClientLink>
                        </li>
                    )
                })}
            </ul>

            {/* ====== 下拉面板 ====== */}
            {(activeId || visible) && (
                <div
                    className="absolute bg-white shadow-2xl border-b border-gray-100 transition-all duration-[400ms]"
                    style={{
                        top: "100%",
                        left: dropStyle.left,
                        width: !hasGrandchildren ? "auto" : "100%",
                        minWidth: !hasGrandchildren ? (dropStyle.minWidth || "220px") : "100%",
                        maxWidth: !hasGrandchildren ? "420px" : "1440px",
                        zIndex: 105,
                        opacity: isOpen ? 1 : 0,
                        transform: !hasGrandchildren
                            ? (isOpen ? "translateY(0) translateX(-50%)" : "translateY(-8px) translateX(-50%)")
                            : (isOpen ? "translateY(0) scaleY(1)" : "translateY(-8px) scaleY(0.96)"),
                        transformOrigin: "top",
                        pointerEvents: isOpen ? "auto" : "none",
                        transitionTimingFunction: EASE,
                    }}
                    onMouseEnter={() => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }}
                >
                    {/* 顶部装饰线 */}
                    <div
                        className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-pink-400 via-pink-300 to-transparent transition-opacity duration-300"
                        style={{ opacity: isOpen ? 1 : 0 }}
                    />

                    <div className="w-full py-12 px-8 bg-white">
                        {hasGrandchildren ? (
                            /* ====== 三级结构：L2 列布局 ====== */
                            <div className="max-w-[1440px] mx-auto">
                                <div className="flex flex-wrap gap-x-20 gap-y-10">
                                    {activeItem?.children.map((child: any, i: number) => (
                                        <div
                                            key={child.id}
                                            className="min-w-[200px] transition-all duration-[400ms]"
                                            style={{
                                                opacity: isOpen ? 1 : 0,
                                                transform: isOpen ? "translateX(0)" : "translateX(-12px)",
                                                transitionDelay: `${i * 60}ms`,
                                                transitionTimingFunction: EASE,
                                            }}
                                        >
                                            {/* L2 标题 */}
                                            <LocalizedClientLink
                                                href={getMenuHref(child.link_type, child.slug, child.medusaHandle)}
                                                className="flex items-center gap-x-2 text-[15px] font-semibold tracking-[0.08em] mb-5 uppercase hover:text-pink-600 transition-colors group"
                                                onClick={() => setActiveId(null)}
                                            >
                                                {/* 左侧小圆点 */}
                                                <span className="w-[5px] h-[5px] rounded-full bg-pink-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                {child.title}
                                            </LocalizedClientLink>
                                            {child.children?.length > 0 && (
                                                <div className="flex flex-col gap-y-5 pl-1">
                                                    <DeepMenuItems items={child.children} level={1} onClose={() => setActiveId(null)} />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            /* ====== 二级结构：纵向列表 ====== */
                            <ul className="flex flex-col space-y-7 items-start min-w-[240px]">
                                {activeItem?.children.map((child: any, i: number) => (
                                    <li
                                        key={child.id}
                                        className="w-full transition-all duration-[400ms]"
                                        style={{
                                            opacity: isOpen ? 1 : 0,
                                            transform: isOpen ? "translateX(0)" : "translateX(-8px)",
                                            transitionDelay: `${i * 50}ms`,
                                            transitionTimingFunction: EASE,
                                        }}
                                    >
                                        <LocalizedClientLink
                                            href={getMenuHref(child.link_type, child.slug, child.medusaHandle)}
                                            className="text-[15px] font-semibold tracking-[0.08em] text-gray-800 hover:text-pink-600 uppercase transition-all duration-300 inline-block hover:translate-x-1"
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
            )}

            {/* ====== 遮罩（按需渲染避免残留） ====== */}
            {(activeId || visible) && (
                <div
                    className="absolute inset-x-0 pointer-events-none"
                    style={{
                        top: "100%",
                        height: "calc(100vh - 80px)",
                        zIndex: 40,
                        background: isOpen ? "rgba(0,0,0,0.06)" : "rgba(0,0,0,0)",
                        backdropFilter: isOpen ? "blur(1px)" : "none",
                        transition: `background 400ms ${EASE}, backdrop-filter 400ms ${EASE}`,
                    }}
                />
            )}
        </nav>
    )
}
