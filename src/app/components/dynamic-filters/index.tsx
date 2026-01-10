"use client"

import React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { clx } from "@medusajs/ui"

type FacetSnapshot = {
    materials?: string[]
    collections?: string[]
    dynamic_options?: {
        title: string
        values: string[]
    }[]
}

export default function DynamicFilters({ facets }: { facets: FacetSnapshot }) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // 核心逻辑：更新 URL 参数
    const handleSelect = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams)
        const normalizedKey = key.toLowerCase()
        const currentFilters = params.getAll(normalizedKey)

        if (currentFilters.includes(value)) {
            // 反选：移除已存在的参数
            const newFilters = currentFilters.filter((v) => v !== value)
            params.delete(normalizedKey)
            newFilters.forEach((v) => params.append(normalizedKey, v))
        } else {
            // 选中：追加新参数
            params.append(normalizedKey, value)
        }

        // 每次筛选都重置页码到第1页，防止溢出白屏
        params.delete("page")

        // 平滑滚动到顶部并更新 URL
        router.push(`${pathname}?${params.toString()}`, { scroll: false })
    }

    // 辅助函数：统一文字风格
    const formatValue = (str: string) => {
        if (!str) return ""
        // 处理类似 90% Nylon + 10% Spandex 这种复杂的 Material 文字，不强行首字母大写
        if (str.includes("%")) return str
        return str.charAt(0).toUpperCase() + str.slice(1)
    }

    return (
        <div className="flex flex-col gap-y-12">

            {/* 1. Collection (系列) */}
            {facets.collections && facets.collections.length > 0 && (
                <FilterSection
                    title="Collection"
                    values={facets.collections}
                    filterKey="collection"
                    activeValues={searchParams.getAll("collection")}
                    onSelect={handleSelect}
                    formatValue={formatValue}
                />
            )}

            {/* 2. Material (材质) */}
            {facets.materials && facets.materials.length > 0 && (
                <FilterSection
                    title="Material"
                    values={facets.materials}
                    filterKey="material"
                    activeValues={searchParams.getAll("material")}
                    onSelect={handleSelect}
                    formatValue={formatValue}
                />
            )}

            {/* 3. Dynamic Options (Color, Size, etc.) */}
            {facets.dynamic_options?.map((option) => (
                <FilterSection
                    key={option.title}
                    title={option.title}
                    values={option.values}
                    filterKey={option.title.toLowerCase()}
                    activeValues={searchParams.getAll(option.title.toLowerCase())}
                    onSelect={handleSelect}
                    formatValue={formatValue}
                />
            ))}
        </div>
    )
}

// 内部复用的小组件：保持代码整洁
function FilterSection({
                           title,
                           values,
                           filterKey,
                           activeValues,
                           onSelect,
                           formatValue
                       }: any) {
    return (
        <div className="flex flex-col gap-y-4">
            <h3 className="text-[11px] uppercase tracking-[0.25em] font-bold text-gray-900 border-l-2 border-black pl-3">
                {title}
            </h3>
            <div className="flex flex-wrap gap-2">
                {values.map((v: string) => {
                    const isSelected = activeValues.includes(v)
                    return (
                        <button
                            key={v}
                            onClick={() => onSelect(filterKey, v)}
                            className={clx(
                                "text-[10px] uppercase tracking-[0.15em] px-3.5 py-2.5 border transition-all duration-300",
                                isSelected
                                    ? "bg-black text-white border-black shadow-md"
                                    : "bg-white text-gray-500 border-gray-100 hover:border-gray-900 hover:text-black"
                            )}
                        >
                            {formatValue(v)}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}