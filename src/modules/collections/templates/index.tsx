import { Suspense } from "react"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { HttpTypes } from "@medusajs/types"
import CollectionHeader from "../collection-header/index"

export default function CollectionTemplate({
                                               sortBy,
                                               collection,
                                               collections,
                                               page,
                                               countryCode,
                                               marketingData,
                                           }: {
    sortBy?: SortOptions
    collection: HttpTypes.StoreCollection
    collections?: HttpTypes.StoreCollection[]
    page?: string
    countryCode: string
    marketingData?: any
}) {
    const pageNumber = page ? parseInt(page) : 1
    const sort = sortBy || "created_at"

    return (
        <div className="w-full overflow-x-hidden">
            <CollectionHeader
                collection={collection}
                collections={collections}
                sort={sort}
            />

            {/* --- 新增：Marketing Banner 区域 --- */}
            {marketingData && (
                <div className="relative w-full h-[40vh] md:h-[60vh] min-h-[300px] mb-8 overflow-hidden bg-gray-100">
                    {/* 媒体层：判断是视频还是图片 */}
                    {marketingData.maketimg?.mime?.includes("video") ? (
                        <video
                            src={marketingData.maketimg.url}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    ) : (
                        marketingData.maketimg?.url && (
                            <img
                                src={marketingData.maketimg.url}
                                alt={marketingData.title || "Collection Banner"}
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        )
                    )}

                    {/* 文字叠加层 (Overlay) */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center bg-black/30 px-4">
                        <h1 className="text-3xl md:text-5xl font-bold text-white uppercase tracking-wider mb-4">
                            {marketingData.title}
                        </h1>
                        {marketingData.description && (
                            <p className="text-base md:text-xl text-white max-w-2xl font-light">
                                {marketingData.description}
                            </p>
                        )}
                    </div>
                </div>
            )}
            {/* --- End Marketing Banner --- */}

            <div className="w-full px-4 md:px-8 relative z-0">
                <Suspense fallback={
                    <div className="w-full py-12">
                        <SkeletonProductGrid numberOfProducts={8} />
                    </div>
                }>
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