import { notFound } from "next/navigation"
import { Suspense } from "react"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import { HttpTypes } from "@medusajs/types"
import CategoryHeader from "../category-header/index"

export default function CategoryTemplate({
                                             category,
                                             allCategoryIds,
                                             sortBy,
                                             page,
                                             countryCode,
                                         }: {
    category: HttpTypes.StoreProductCategory
    allCategoryIds: string[]
    sortBy?: SortOptions
    page?: string
    countryCode: string
}) {
    const pageNumber = page ? parseInt(page) : 1
    const sort = sortBy || "created_at"

    if (!category || !countryCode) notFound()

    // 这里的逻辑依然在服务端运行
    const parents = [] as HttpTypes.StoreProductCategory[]
    const getParents = (cat: HttpTypes.StoreProductCategory) => {
        if (cat.parent_category) {
            parents.push(cat.parent_category)
            getParents(cat.parent_category)
        }
    }
    getParents(category)

    return (
        <div className="w-full overflow-x-hidden">
            {/* 渲染客户端 Header，传入处理好的数据 */}
            <CategoryHeader
                category={category}
                parents={parents}
                sort={sort}
            />

            <div className="w-full px-4 md:px-8 relative z-0">
                <Suspense
                    fallback={
                        <div className="w-full py-12">
                            <SkeletonProductGrid
                                numberOfProducts={8}
                            />
                        </div>
                    }
                >
                    <PaginatedProducts
                        sortBy={sort}
                        page={pageNumber}
                        categoryId={allCategoryIds}
                        countryCode={countryCode}
                    />
                </Suspense>
            </div>
        </div>
    )
}