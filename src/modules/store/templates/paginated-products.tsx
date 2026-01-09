import { getRegion } from "@lib/data/regions"
import ProductPreview from "@modules/products/components/product-preview"
import { Pagination } from "@modules/store/components/pagination"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { searchProducts } from "@lib/util/meilisearch-client"

const PRODUCT_LIMIT = 12

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
    // 1. 优先获取 Region 信息（计算价格用）
    const region = await getRegion(countryCode)
    if (!region) return null

    // 2. 【核心重构】调用 Meilisearch 搜索函数
    // 注意：这里我们直接把参数喂给 Meilisearch
    const {
        products,
        count,
        totalPages
    } = await searchProducts({
        categoryId: Array.isArray(categoryId) ? categoryId[0] : categoryId, // 传主ID
        collectionId,
        material,
        size,
        color,
        page,
        limit: PRODUCT_LIMIT,
        // sortBy: sortBy // 如果你 Meilisearch 做了排序索引也可以传
    })

    // 3. 处理空状态
    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24">
                <p className="text-gray-500">No products found matching your filters.</p>
            </div>
        )
    }

    return (
        <>
            <ul
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 w-full"
                data-testid="products-list"
            >
                {products.map((p: any) => {
                    // 注意：Meilisearch 返回的数据结构需要适配 ProductPreview
                    // 确保它包含 id, handle, title, thumbnail 以及 variants 等必要字段
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