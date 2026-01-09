"use client"

import { HttpTypes } from "@medusajs/types"
import FilterRadioGroup from "./filter-radio-group"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

type FilterMenuProps = {
    products: HttpTypes.StoreProduct[]
    collections?: HttpTypes.StoreCollection[]
}

const FilterMenu = ({ products, collections }: FilterMenuProps) => {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // --- 核心联动逻辑：修改 URL 参数 ---
    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString())
            if (value === params.get(name)) {
                params.delete(name) // 如果点的是已选中的，就取消勾选
            } else {
                params.set(name, value)
            }
            params.set("page", "1") // 切换筛选时重置回第一页
            return params.toString()
        },
        [searchParams]
    )

    const handleFilterChange = (type: string, value: string) => {
        router.push(pathname + "?" + createQueryString(type, value), { scroll: false })
    }

    // --- 数据清洗与去重 ---

    // 1. 提取 Sizes & Colors (从 variants 中精准去重)
    const sizes = Array.from(new Set(
        products.flatMap(p => p.variants?.flatMap(v =>
            v.options?.filter(o => o.option?.title?.toLowerCase() === "size").map(o => o.value)
        ))
    )).filter(Boolean).sort() as string[]

    const colors = Array.from(new Set(
        products.flatMap(p => p.variants?.flatMap(v =>
            v.options?.filter(o => o.option?.title?.toLowerCase() === "color").map(o => o.value)
        ))
    )).filter(Boolean).sort() as string[]

    // 2. 提取 Material (通过 Tag 约定，去重并去掉前缀)
    const materials = Array.from(new Set(
        products.flatMap(p => p.tags?.map(t => t.value).filter(v => v?.startsWith("Mat:")))
    )).filter(Boolean) as string[]

    return (
        <div className="flex flex-col gap-y-12">
            {/* 1. 系列 (Collections) */}
            {collections && collections.length > 0 && (
                <FilterRadioGroup
                    title="Collection"
                    items={collections.map(c => ({ value: c.handle!, label: c.title! }))}
                    value={searchParams.get("collection")}
                    handleChange={(v) => handleFilterChange("collection", v)}
                />
            )}

            {/* 2. 材质 (Material) */}
            {materials.length > 0 && (
                <FilterRadioGroup
                    title="Material"
                    items={materials.map(m => ({
                        value: m,
                        label: m.replace("Mat:", "").toUpperCase()
                    }))}
                    value={searchParams.get("material")}
                    handleChange={(v) => handleFilterChange("material", v)}
                />
            )}

            {/* 3. 尺寸 (Size) */}
            {sizes.length > 0 && (
                <FilterRadioGroup
                    title="Size"
                    items={sizes.map(s => ({ value: s, label: s }))}
                    value={searchParams.get("size")}
                    handleChange={(v) => handleFilterChange("size", v)}
                />
            )}

            {/* 4. 颜色 (Color) */}
            {colors.length > 0 && (
                <FilterRadioGroup
                    title="Color"
                    items={colors.map(c => ({ value: c, label: c }))}
                    value={searchParams.get("color")}
                    handleChange={(v) => handleFilterChange("color", v)}
                />
            )}
        </div>
    )
}

export default FilterMenu