"use client"

import { useState, useRef, useEffect } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getMenuHref } from "@lib/menu-utils"

export default function NavLinks({ menuTree }: { menuTree: any[] }) {
    const [activeId, setActiveId] = useState<number | null>(null)
    const [activeL2, setActiveL2] = useState<number | null>(null)
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
        // 自动选中第一个 L2
        const item = menuTree?.find((i) => i.id === id)
        if (item?.children?.length) {
            setActiveL2(item.children[0].id)
        }
        setVisible(true)
    }
    const close = () => {
        leaveTimeoutRef.current = setTimeout(() => {
            setActiveId(null)
            setActiveL2(null)
            setTimeout(() => setVisible(false), 250)
        }, 100)
    }
    const cancelClose = () => {
        if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current)
    }

    const activeItem = menuTree?.find((i) => i.id === activeId)
    const activeL2Item = activeItem?.children?.find((c: any) => c.id === activeL2)
    const isOpen = !!(activeId && activeItem?.children?.length)

    if (!menuTree?.length) return null

    // 递归渲染子级菜单链接（L3+）
    function SubLinks({ items, depth }: { items: any[]; depth: number }) {
        const isFirstSub = depth === 2
        return (
            <ul className={isFirstSub ? "flex flex-col gap-y-1.5" : "ml-3 mt-0.5 flex flex-col gap-y-0.5 border-l border-gray-100 pl-2.5"}>
                {items.map((item: any) => (
                    <li key={item.id}>
                        <LocalizedClientLink
                            href={getMenuHref(item.link_type, item.slug, item.medusaHandle)}
                            className={isFirstSub
                                ? "text-[12px] text-gray-500 hover:text-black uppercase tracking-[0.04em] transition-colors duration-200"
                                : "text-[11px] text-gray-400 hover:text-black uppercase tracking-[0.04em] transition-colors duration-200"}
                            onClick={() => setActiveId(null)}
                        >
                            {item.title}
                        </LocalizedClientLink>
                        {item.children?.length > 0 && (
                            <SubLinks items={item.children} depth={depth + 1} />
                        )}
                    </li>
                ))}
            </ul>
        )
    }

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
                        <div className="max-w-[1440px] mx-auto py-0">
                            {/* "All category" 链接 */}
                            <div className="px-10 xl:px-14 pt-10 pb-6 border-b border-gray-50">
                                <LocalizedClientLink
                                    href={getMenuHref(activeItem.link_type, activeItem.slug, activeItem.medusaHandle)}
                                    className="inline-flex items-center gap-x-2 text-sm font-black uppercase tracking-[0.12em] text-black hover:gap-x-3 transition-all duration-200"
                                    onClick={() => setActiveId(null)}
                                >
                                    All {activeItem.title}
                                    <span className="text-lg leading-none">→</span>
                                </LocalizedClientLink>
                            </div>

                            {/* RL 风格双栏布局：左侧 L2 列表 + 右侧 L3+ 内容 */}
                            <div className="flex">
                                {/* 左侧 L2 列表 */}
                                <div className="w-[240px] xl:w-[280px] shrink-0 border-r border-gray-50 py-8 px-8 xl:px-10">
                                    <div className="flex flex-col gap-y-0.5">
                                        {activeItem.children.map((child: any) => {
                                            const isActiveL2 = activeL2 === child.id
                                            return (
                                                <button
                                                    key={child.id}
                                                    onMouseEnter={() => setActiveL2(child.id)}
                                                    onClick={() => setActiveL2(child.id)}
                                                    className={`group flex items-center justify-between w-full text-left py-3 px-3 rounded-lg transition-all duration-200 ${
                                                        isActiveL2
                                                            ? "bg-gray-50"
                                                            : "hover:bg-gray-50/50"
                                                    }`}
                                                >
                                                    <span
                                                        className={`text-[13px] font-semibold uppercase tracking-[0.06em] transition-colors duration-200 ${
                                                            isActiveL2 ? "text-black" : "text-gray-600 group-hover:text-black"
                                                        }`}
                                                    >
                                                        {child.title}
                                                    </span>
                                                    <svg
                                                        className={`w-4 h-4 transition-all duration-200 ${
                                                            isActiveL2 ? "opacity-100 text-black" : "opacity-0 text-gray-300 group-hover:opacity-100"
                                                        }`}
                                                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 18l6-6-6-6" />
                                                    </svg>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* 右侧 L3+ 内容区 */}
                                <div className="flex-1 py-8 px-10 xl:px-14">
                                    {activeL2Item ? (
                                        <div key={activeL2Item.id} className="animate-in fade-in slide-in-from-right-2 duration-300">
                                            {/* L2 标题链接 */}
                                            <LocalizedClientLink
                                                href={getMenuHref(activeL2Item.link_type, activeL2Item.slug, activeL2Item.medusaHandle)}
                                                className="block text-[15px] font-black uppercase tracking-[0.1em] text-black hover:text-gray-600 transition-colors mb-8"
                                                onClick={() => setActiveId(null)}
                                            >
                                                {activeL2Item.title}
                                            </LocalizedClientLink>
                                            {/* L3+ 递归 */}
                                            {activeL2Item.children?.length > 0 ? (
                                                <div className="flex flex-wrap gap-x-16 gap-y-8">
                                                    {activeL2Item.children.map((l3: any) => (
                                                        <div key={l3.id} className="min-w-[160px] max-w-[220px]">
                                                            <LocalizedClientLink
                                                                href={getMenuHref(l3.link_type, l3.slug, l3.medusaHandle)}
                                                                className="block text-[13px] font-semibold uppercase tracking-[0.06em] text-gray-900 hover:text-black transition-colors mb-2.5"
                                                                onClick={() => setActiveId(null)}
                                                            >
                                                                {l3.title}
                                                            </LocalizedClientLink>
                                                            {l3.children?.length > 0 && (
                                                                <SubLinks items={l3.children} depth={2} />
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-gray-300 text-xs uppercase tracking-[0.2em]">Browse {activeL2Item.title}</p>
                                            )}
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
}
