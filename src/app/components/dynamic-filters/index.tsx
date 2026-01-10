"use client"

import React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { clx } from "@medusajs/ui"

export default function DynamicFilters({ facets }: { facets: any }) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const handleSelect = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams)
        const currentFilters = params.getAll(key)

        if (currentFilters.includes(value)) {
            const newFilters = currentFilters.filter((v) => v !== value)
            params.delete(key)
            newFilters.forEach((v) => params.append(key, v))
        } else {
            params.append(key, value)
        }
        // 过滤后重置页码到第1页，避免在第5页过滤后结果只有1页导致白屏
        params.delete("page")
        router.push(`${pathname}?${params.toString()}`, { scroll: false })
    }

    // 辅助函数：格式化显示，首字母大写
    const formatLabel = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

    return (
        <div className="flex flex-col gap-y-10">

            {/* 1. 专门渲染 Collection (如果存在) */}
            {facets.collections && facets.collections.length > 0 && (
                <div className="flex flex-col gap-y-4">
                    <h3 className="text-[12px] uppercase tracking-[0.2em] font-bold text-gray-900">
                        Collection
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {facets.collections.map((c: string) => {
                            const isSelected = searchParams.getAll("collection").includes(c)
                            return (
                                <button
                                    key={c}
                                    onClick={() => handleSelect("collection", c)}
                                    className={clx(
                                        "text-[11px] uppercase tracking-widest px-4 py-2 border transition-all duration-200",
                                        isSelected
                                            ? "bg-black text-white border-black"
                                            : "bg-white text-gray-500 border-gray-200 hover:border-gray-900"
                                    )}
                                >
                                    {formatLabel(c)}
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* 2. 专门渲染 Material (如果需要的话，也可以展示) */}
            {/* {facets.materials && facets.materials.length > 0 && (
        <div className="flex flex-col gap-y-4">
          <h3 className="text-[12px] uppercase tracking-[0.2em] font-bold text-gray-900">Material</h3>
          ...渲染逻辑同上
        </div>
      )}
      */}

            {/* 3. 渲染动态属性 (Color, Size 等) */}
            {facets.dynamic_options?.map((option: any) => (
                <div key={option.title} className="flex flex-col gap-y-4">
                    <h3 className="text-[12px] uppercase tracking-[0.2em] font-bold text-gray-900">
                        {option.title}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {option.values.map((value: string) => {
                            const isSelected = searchParams.getAll(option.title.toLowerCase()).includes(value)
                            return (
                                <button
                                    key={value}
                                    onClick={() => handleSelect(option.title.toLowerCase(), value)}
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