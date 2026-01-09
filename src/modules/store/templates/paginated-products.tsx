import { listProductsWithSort } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductPreview from "@modules/products/components/product-preview"
import { Pagination } from "@modules/store/components/pagination"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

const PRODUCT_LIMIT = 12

// 1. 扩展参数类型以适配 V2 筛选
type PaginatedProductsParams = {
    limit: number
    collection_id?: string[]
    category_id?: string[]
    id?: string[]
    order?: string
    tag_value?: string[]           // V2 材质筛选
    "variants.options.value"?: string[] // V2 规格筛选 (Size/Color)
}

export default async function PaginatedProducts({
                                                    sortBy,
                                                    page,
                                                    collectionId,
                                                    categoryId,
                                                    productsIds,
                                                    countryCode,
                                                    material,
                                                    size,
                                                    color,
                                                }: {
    sortBy?: SortOptions
    page: number
    collectionId?: string
    categoryId?: string | string[]
    productsIds?: string[]
    countryCode: string
    material?: string
    size?: string
    color?: string
}) {
    const queryParams: PaginatedProductsParams = {
        limit: PRODUCT_LIMIT,
        "tag_value[]": material ? [material] : undefined,
    }

    // A. 基础过滤 (保持原样)
    if (collectionId) {
        queryParams["collection_id"] = [collectionId]
    }

    if (categoryId) {
        queryParams["category_id"] = Array.isArray(categoryId)
            ? categoryId
            : [categoryId]
    }

    if (productsIds) {
        queryParams["id"] = productsIds
    }

    // B. 【核心】材质过滤 (适配 Medusa V2 tag_value)
    if (material) {
        queryParams["tag_value"] = [material]
    }

    // C. 【核心】规格过滤 (适配 Medusa V2 Size/Color)
    const activeOptions: string[] = []
    if (size) activeOptions.push(size)
    if (color) activeOptions.push(color)

    if (activeOptions.length > 0) {
        // V2 允许直接通过这个 key 匹配变体下所有的 option values
        queryParams["variants.options.value"] = activeOptions
    }

    if (sortBy === "created_at") {
        queryParams["order"] = "created_at"
    }

    const region = await getRegion(countryCode)

    if (!region) {
        return null
    }

    // D. 执行查询
    let {
        response: { products, count },
    } = await listProductsWithSort({
        page,
        queryParams, // 这里的参数现在包含了过滤条件
        sortBy,
        countryCode,
    })

    const totalPages = Math.ceil(count / PRODUCT_LIMIT)

    return (
        <>
            <ul
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 w-full"
                data-testid="products-list"
            >
                {products.map((p) => {
                    return (
                        <li
                            key={p.id}
                            className="group relative transition-colors duration-200"
                        >
                            <div className="p-4 h-full flex flex-col">
                                <ProductPreview product={p} region={region} />
                            </div>
                            <div className="absolute inset-0 border-2 border-transparent group-hover:border-gray-200 pointer-events-none transition-colors duration-200" />
                        </li>
                    )
                })}
            </ul>

            {totalPages > 1 && (
                <div className="mt-12 pb-12 px-4">
                    <Pagination
                        data-testid="product-pagination"
                        page={page}
                        totalPages={totalPages}
                    />
                </div>
            )}
        </>
    )
}