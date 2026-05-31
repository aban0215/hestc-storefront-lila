"use client"

import { useState, useRef, useEffect } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getMenuHref } from "@lib/menu-utils"

export default function NavLinks({ menuTree }: { menuTree: any[] }) {
    const [activeId, setActiveId] = useState<number | null>(null)
    const [visible, setVisible] = useState(false)
    const [navBottom, setNavBottom] = useState(56) // 默认 h-14 = 56px
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const leaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const navRef = useRef<HTMLElement>(null)

    // 精确获取 nav 底部位置（处理响应式高度变化）
    useEffect(() => {
        const update = () => {
            if (navRef.current) {
                setNavBottom(navRef.current.getBoundingClientRect().bottom)
            }
        }
        update()
        window.addEventListener("resize", update)
        window.addEventListener("scroll", update)
        return () => {
            window.removeEventListener("resize", update)
            window.removeEventListener("scroll", update)
        }
    }, [])

    const open = (id: number) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current)
        setActiveId(id)
        setVisible(true)
    }
    const close = () => {
        leaveTimeoutRef.current = setTimeout(() => {
            setActiveId(null)
            setTimeout(() => setVisible(false), 250)
        }, 100)
    }
    const cancelClose = () => {
        if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current)
    }

    const activeItem = menuTree?.find((i) => i.id === activeId)
    const isOpen = !!(activeId && activeItem?.children?.length)

    if (!menuTree?.length) return null

    return (
        <nav ref={navRef} className="hidden lg:flex items-center h-full" onMouseLeave={close}>
            {/* ── L1 横排 ── */}
            <ul className="flex items-center h-full">
                {menuTree.map((item) => {
                    const isActive = activeId === item.id
                    return (
                        <li
                            key={item.id}
                            className="h-full"
                            onMouseEnter={() => open(item.id)}
                        >
                            <LocalizedClientLink
                                href={getMenuHref(item.link_type, item.slug, item.medusaHandle)}
                                className={`relative flex items-center h-full px-4 xl:px-5 text-[13px] xl:text-sm font-bold uppercase tracking-[0.12em] whitespace-nowrap transition-colors duration-200 ${
                                    isActive ? "text-black" : "text-gray-900 hover:text-black"
                                }`}
                            >
                                {item.title}
                                {/* 底部指示条 */}
                                <span
                                    className={`absolute bottom-0 left-0 right-0 h-[3px] bg-black transition-transform duration-[250ms] ease-out origin-left ${
                                        isActive ? "scale-x-100" : "scale-x-0"
                                    }`}
                                />
                            </LocalizedClientLink>
                        </li>
                    )
                })}
            </ul>

            {/* ── 遮罩 + 下拉面板（fixed 全屏，加 key 防重叠） ── */}
            {visible && activeItem?.children?.length > 0 && (
                <div key={activeId}>
                    {/* 遮罩 */}
                    <div
                        className={`fixed inset-0 bg-black/15 transition-opacity duration-[250ms] ease-out pointer-events-none ${
                            isOpen ? "opacity-100" : "opacity-0"
                        }`}
                        style={{ top: navBottom, zIndex: 40 }}
                    />

                    {/* 下拉面板 */}
                    <div
                        className={`fixed left-0 right-0 bg-white shadow-[0_35px_60px_-15px_rgba(0,0,0,0.15)] border-t border-gray-100 transition-all duration-[250ms] ease-out ${
                            isOpen
                                ? "opacity-100 translate-y-0"
                                : "opacity-0 -translate-y-1 pointer-events-none"
                        }`}
                        style={{ top: navBottom, zIndex: 50 }}
                        onMouseEnter={cancelClose}
                        onMouseLeave={close}
                    >
                        <div className="max-w-[1440px] mx-auto py-10 px-10 xl:px-14">
                            {/* "All category" 链接 */}
                            <LocalizedClientLink
                                href={getMenuHref(activeItem.link_type, activeItem.slug, activeItem.medusaHandle)}
                                className="inline-flex items-center gap-x-2 text-sm font-black uppercase tracking-[0.12em] text-black hover:gap-x-3 transition-all duration-200 mb-10"
                                onClick={() => setActiveId(null)}
                            >
                                All {activeItem.title}
                                <span className="text-lg leading-none">→</span>
                            </LocalizedClientLink>

                            {/* L2 列网格（flex-wrap 自适应） */}
                            <div className="flex flex-wrap gap-x-14 gap-y-8">
                                {activeItem.children.map((child: any) => (
                                    <div key={child.id} className="min-w-[160px] max-w-[220px]">
                                        {/* L2 标题 */}
                                        <LocalizedClientLink
                                            href={getMenuHref(child.link_type, child.slug, child.medusaHandle)}
                                            className="block text-[13px] font-black uppercase tracking-[0.1em] text-black hover:text-gray-600 transition-colors mb-3"
                                            onClick={() => setActiveId(null)}
                                        >
                                            {child.title}
                                        </LocalizedClientLink>
                                        {/* L3 列表 */}
                                        {child.children?.length > 0 && (
                                            <ul className="flex flex-col gap-y-1.5">
                                                {child.children.map((gc: any) => (
                                                    <li key={gc.id}>
                                                        <LocalizedClientLink
                                                            href={getMenuHref(gc.link_type, gc.slug, gc.medusaHandle)}
                                                            className="text-[12px] text-gray-500 hover:text-black uppercase tracking-[0.04em] transition-colors duration-200"
                                                            onClick={() => setActiveId(null)}
                                                        >
                                                            {gc.title}
                                                        </LocalizedClientLink>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
}
