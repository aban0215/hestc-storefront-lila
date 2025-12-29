// 注意：这里绝对不能有 "use client"
import { Suspense } from "react"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { HttpTypes } from "@medusajs/types"
// 引入刚才创建的客户端 Header
import CollectionHeader from "../collection-header/index"

export default function CollectionTemplate({
                                               sortBy,
                                               collection,
                                               collections,
                                               page,
                                               countryCode,
                                           }: {
    sortBy?: SortOptions
    collection: HttpTypes.StoreCollection
    collections?: HttpTypes.StoreCollection[]
    page?: string
    countryCode: string
}) {
    const pageNumber = page ? parseInt(page) : 1
    const sort = sortBy || "created_at"

    return (
        <div className="w-full overflow-x-hidden">
            {/* 这里的 Header 内部有 "use client"，但 Template 本身是 Server Component */}
            <CollectionHeader
                collection={collection}
                collections={collections}
                sort={sort}
            />

            <div className="w-full px-4 md:px-8 relative z-0">
                <Suspense fallback={
                    <div className="w-full py-12">
                        <SkeletonProductGrid numberOfProducts={8} />
                    </div>
                }>
                    {/* 现在这个异步组件可以正常工作了 */}
                    <PaginatedProducts
                        sortBy={sort}
                        page={pageNumber}
                        collectionId={collection.id}
                        countryCode={countryCode}
                    />
                </Suspense>
            </div>
        </div>
    )
}