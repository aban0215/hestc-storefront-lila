"use client"

import { useState, useEffect } from "react"
import { Menu, X, ChevronRight } from "lucide-react" // 如果没安装 lucide-react，请 npm install lucide-react
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { usePathname } from "next/navigation"

export default function MobileMenu({ menuTree, brandData }: { menuTree: any[], brandData: any }) {
    const [isOpen, setIsOpen] = useState(false)
    const [mounted, setMounted] = useState(false) // 新增状态
    const pathname = usePathname()

    useEffect(() => {
        setMounted(true) // 只有在客户端挂载后才设为 true
    }, [])

    // 路由变化自动关闭
    useEffect(() => setIsOpen(false), [pathname])

    if (!mounted) return <div className="p-2 w-10" />; // 占位符，避免 SSR 冲突

    return (
        <>
            <button onClick={() => setIsOpen(true)} className="p-2 -ml-2 text-gray-800">
                <Menu size={24} strokeWidth={1.5} />
            </button>

            {/* 黑色半透明遮罩 */}
            <div
                className={`fixed inset-0 z-[1000] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
                onClick={() => setIsOpen(false)}
            />

            {/* 侧边抽屉 */}
            <div className={`fixed inset-y-0 left-0 z-[1001] w-[80%] max-w-[300px] bg-white transform transition-transform duration-500 ease-out ${
                isOpen ? "translate-x-0" : "-translate-x-full"
            }`}>
                <div className="flex flex-col h-full">
                    <div className="flex justify-between items-center px-6 py-5 border-b">
            <span className="text-sm font-bold tracking-widest uppercase">
              {brandData?.sitename || "MENU"}
            </span>
                        <button onClick={() => setIsOpen(false)}><X size={22} /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-2 py-4">
                        {menuTree.map((item: any) => (
                            <div key={item.id} className="mb-2">
                                <LocalizedClientLink
                                    href={item.slug || "/"}
                                    className="flex justify-between items-center px-4 py-3 text-[11px] font-bold tracking-[0.2em] uppercase text-gray-800"
                                >
                                    {item.title}
                                    {item.children?.length > 0 && <ChevronRight size={14} />}
                                </LocalizedClientLink>

                                {item.children?.length > 0 && (
                                    <div className="ml-4 border-l border-gray-100">
                                        {item.children.map((child: any) => (
                                            <LocalizedClientLink
                                                key={child.id}
                                                href={child.slug || "/"}
                                                className="block px-6 py-2 text-[10px] tracking-[0.15em] text-gray-500 uppercase"
                                            >
                                                {child.title}
                                            </LocalizedClientLink>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}