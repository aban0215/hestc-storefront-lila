"use client"

import { HttpTypes } from "@medusajs/types"
import FilterRadioGroup from "@modules/common/components/filter-radio-group";

type FilterMenuProps = {
    products: HttpTypes.StoreProduct[]
    collections?: HttpTypes.StoreCollection[]
}

const FilterMenu = ({ products, collections }: FilterMenuProps) => {

    // --- 逻辑：从产品中提取各种属性 ---

    // 1. 提取 Sizes (从 variants 里的 options 提取)
    const allSizes = Array.from(
        new Set(
            products
                .flatMap((p) => p.variants?.flatMap((v) => v.options?.filter(o => o.option?.title === "Size").map(o => o.value)))
                .filter(Boolean)
        )
    ).map(s => ({ value: s as string, label: s as string }))

    // 2. 提取 Colors
    const allColors = Array.from(
        new Set(
            products
                .flatMap((p) => p.variants?.flatMap((v) => v.options?.filter(o => o.option?.title === "Color").map(o => o.value)))
                .filter(Boolean)
        )
    ).map(c => ({ value: c as string, label: c as string }))

    // 3. 提取 Material (从 Tags 中过滤出带 "Mat:" 前缀的)
    const allMaterials = Array.from(
        new Set(
            products
                .flatMap((p) => p.tags?.map(t => t.value))
                .filter(t => t?.startsWith("Mat:")) // 匹配咱们约定的前缀
        )
    ).map(m => ({
        value: m as string,
        label: (m as string).replace("Mat:", "").toUpperCase() // UI 只显示材质名
    }))

    // 4. 格式化 Collections
    const collectionOptions = collections?.map(c => ({
        value: c.id,
        label: c.title
    })) || []

    return (
        <div className="flex flex-col gap-y-12">
            {/* 系列筛选 */}
            {collectionOptions.length > 0 && (
                <FilterRadioGroup
                    title="Collection"
                    items={collectionOptions}
                    value={null} // 暂时为 null，后续接状态
                    handleChange={(v) => console.log("Collection:", v)}
                />
            )}

            {/* 材质筛选 */}
            {allMaterials.length > 0 && (
                <FilterRadioGroup
                    title="Material"
                    items={allMaterials}
                    value={null}
                    handleChange={(v) => console.log("Material:", v)}
                />
            )}

            {/* 尺寸筛选 */}
            {allSizes.length > 0 && (
                <FilterRadioGroup
                    title="Size"
                    items={allSizes}
                    value={null}
                    handleChange={(v) => console.log("Size:", v)}
                />
            )}

            {/* 颜色筛选 */}
            {allColors.length > 0 && (
                <FilterRadioGroup
                    title="Color"
                    items={allColors}
                    value={null}
                    handleChange={(v) => console.log("Color:", v)}
                />
            )}
        </div>
    )
}

export default FilterMenu