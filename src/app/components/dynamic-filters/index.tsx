"use client"

import React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { clx } from "@medusajs/ui"

type FacetSnapshot = {
    dynamic_options: {
        title: string
        values: string[]
    }[]
}

export default function DynamicFilters({ facets }: { facets: FacetSnapshot }) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // 处理点击逻辑：将选择的属性更新到 URL 中
    const handleSelect = (title: string, value: string) => {
        const params = new URLSearchParams(searchParams)
        const currentFilters = params.getAll(title.toLowerCase())

        if (currentFilters.includes(value)) {
            // 如果已经选中，则移除（反选）
            const newFilters = currentFilters.filter((v) => v !== value)
            params.delete(title.toLowerCase())
            newFilters.forEach((v) => params.append(title.toLowerCase(), v))
        } else {
            // 否则添加
            params.append(title.toLowerCase(), value)
        }

        // 更新 URL，不刷新页面
        router.push(`${pathname}?${params.toString()}`, { scroll: false })
    }

    return (
        <div className="flex flex-col gap-y-10 py-8">
            {facets.dynamic_options.map((option) => (
                <div key={option.title} className="flex flex-col gap-y-4">
                    {/* 标题：延续你搜索框的风格：大写、间距、细字 */}
                    <h3 className="text-[12px] uppercase tracking-[0.2em] font-bold text-gray-900">
                        {option.title}
                    </h3>

                    <div className="flex flex-wrap gap-2">
                        {option.values.map((value) => {
                            const isSelected = searchParams.getAll(option.title.toLowerCase()).includes(value)

                            return (
                                <button
                                    key={value}
                                    onClick={() => handleSelect(option.title, value)}
                                    className={clx(
                                        "text-[11px] uppercase tracking-widest px-4 py-2 border transition-all duration-200",
                                        isSelected
                                            ? "bg-black text-white border-black"
                                            : "bg-white text-gray-500 border-gray-200 hover:border-gray-900"
                                    )}
                                >
                                    {value}
                                </button>
                            )
                        })}
                    </div>
                </div>
            ))}
        </div>
    )
}