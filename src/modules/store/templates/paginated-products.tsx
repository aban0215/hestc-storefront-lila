import { listProductsWithSort } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductPreview from "@modules/products/components/product-preview"
import { Pagination } from "@modules/store/components/pagination"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

const PRODUCT_LIMIT = 12

// 增强参数类型，允许接收动态过滤字段
type PaginatedProductsParams = {
    limit: number
    collection_id?: string[]
    category_id?: string[]
    id?: string[]
    order?: string
    // 允许其他动态 key，如 color, size, material
    [key: string]: any
}

export default async function PaginatedProducts({
                                                    sortBy,
                                                    page,
                                                    collectionId,
                                                    categoryId,
                                                    productsIds,
                                                    countryCode,
                                                    searchParams, // --- 新增：接收从上层页面传下来的 URL 参数 ---
                                                }: {
    sortBy?: SortOptions
    page: number
    collectionId?: string
    categoryId?: string | string[]
    productsIds?: string[]
    countryCode: string
    searchParams?: Record<string, string | string[]> // --- 新增类型声明 ---
}) {
    const queryParams: PaginatedProductsParams = {
        limit: PRODUCT_LIMIT,
    }

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

    // --- 核心过滤逻辑：解析 URL 参数并注入查询 ---
    if (searchParams) {
        // 定义我们允许过滤的字段白名单
        const filterKeys = ["color", "size", "material", "collection"]

        filterKeys.forEach((key) => {
            const value = searchParams[key]
            if (value) {
                // Medusa API 期待数组格式，如 color: ["Black", "Red"]
                queryParams[key] = Array.isArray(value) ? value : [value]
            }
        })
    }

    if (sortBy === "created_at") {
        queryParams["order"] = "created_at"
    }

    const region = await getRegion(countryCode)

    if (!region) {
        return null
    }

    // 执行查询：现在 queryParams 已经包含了筛选条件
    let {
        response: { products, count },
    } = await listProductsWithSort({
        page,
        queryParams,
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
                            className="group transition-colors duration-200 relative"
                        >
                            <div className="p-4 h-full flex flex-col">
                                <ProductPreview product={p} region={region} />
                            </div>
                            {/* 悬停效果 */}
                            <div className="absolute inset-0 border-2 border-transparent group-hover:border-gray-200 pointer-events-none transition-colors duration-200" />
                        </li>
                    )
                })}
            </ul>

            {/* 分页组件 */}
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