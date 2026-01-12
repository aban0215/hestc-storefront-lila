"use client"

import React, { useState, useEffect } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { clx, Button } from "@medusajs/ui"

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

    // --- 1. 核心状态：存放临时的、未提交的筛选条件 ---
    // 初始化时从 URL 中提取现有参数
    const [tempFilters, setTempFilters] = useState<Record<string, string | undefined>>({})

    // 同步：当 URL 改变时（比如点 Apply 后或手动清空），同步内部状态
    useEffect(() => {
        const initialFilters: Record<string, string> = {}
        searchParams.forEach((value, key) => {
            initialFilters[key] = value
        })
        setTempFilters(initialFilters)
    }, [searchParams])

    // --- 2. 处理单选逻辑 ---
    const handleTempSelect = (key: string, value: string) => {
        const normalizedKey = key.toLowerCase()
        setTempFilters(prev => ({
            ...prev,
            // 如果点的是已经选中的，就取消选择；否则直接覆盖旧值（实现单选）
            [normalizedKey]: prev[normalizedKey] === value ? undefined : value
        }))
    }

    // --- 3. 应用筛选 (真正的 URL 更新) ---
    const handleApply = () => {
        const params = new URLSearchParams()

        // 将 tempFilters 中有值的项写入 URL
        Object.entries(tempFilters).forEach(([key, value]) => {
            if (value) {
                params.set(key, value) // set 会确保同一个 key 只有一个值，实现单选
            }
        })

        // 重置页码
        params.delete("page")

        router.push(`${pathname}?${params.toString()}`, { scroll: false })
    }

    // --- 4. 取消/清空筛选 ---
    const handleClear = () => {
        setTempFilters({}) // 清空临时状态
        router.push(pathname, { scroll: false }) // 清空 URL 参数
    }

    const formatValue = (str: string) => {
        if (!str) return ""
        if (str.includes("%")) return str
        return str.charAt(0).toUpperCase() + str.slice(1)
    }

    return (
        <div className="flex flex-col gap-y-12 relative pb-24">
            {/* 1. Collection (系列) */}
            {facets.collections && facets.collections.length > 0 && (
                <FilterSection
                    title="Collection"
                    values={facets.collections}
                    filterKey="collection"
                    selectedValue={tempFilters["collection"]}
                    onSelect={handleTempSelect}
                    formatValue={formatValue}
                />
            )}

            {/* 2. Material (材质) */}
            {facets.materials && facets.materials.length > 0 && (
                <FilterSection
                    title="Material"
                    values={facets.materials}
                    filterKey="material"
                    selectedValue={tempFilters["material"]}
                    onSelect={handleTempSelect}
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
                    selectedValue={tempFilters[option.title.toLowerCase()]}
                    onSelect={handleTempSelect}
                    formatValue={formatValue}
                />
            ))}

            {/* --- 5. 悬浮/底部的控制按钮 --- */}
            <div className="sticky bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md pt-6 pb-2 border-t flex gap-2">
                <button
                    onClick={handleClear}
                    className="flex-1 text-[10px] uppercase tracking-widest py-4 border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                    Clear All
                </button>
                <button
                    onClick={handleApply}
                    className="flex-1 text-[10px] uppercase tracking-widest py-4 bg-black text-white hover:bg-gray-800 transition-colors"
                >
                    Apply Filters
                </button>
            </div>
        </div>
    )
}

// 内部小组件
function FilterSection({
                           title,
                           values,
                           filterKey,
                           selectedValue,
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
                    // 现在的判断逻辑简单了：直接对比字符串
                    const isSelected = selectedValue === v
                    return (
                        <button
                            key={v}
                            onClick={() => onSelect(filterKey, v)}
                            className={clx(
                                "text-[10px] uppercase tracking-[0.15em] px-3.5 py-2.5 border transition-all duration-300",
                                isSelected
                                    ? "bg-black text-white border-black"
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