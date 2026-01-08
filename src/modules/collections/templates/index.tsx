import { Suspense } from "react"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { HttpTypes } from "@medusajs/types"
import CollectionHeader from "../collection-header/index"
import BackButton from "@modules/account/components/back-button";

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
        <div className="w-full overflow-x-hidden bg-white">
            {/* 1. 顶部系列头：增加 pt 避开导航栏，保持纯净感 */}
            <div className="pt-24 md:pt-32 pb-12 px-4 md:px-8 flex flex-col items-center">
                <h1 className="text-[28px] md:text-[40px] font-light uppercase tracking-[0.3em] text-gray-900 mb-6">
                    {collection.title}
                </h1>
                {marketingData?.description && (
                    <p className="max-w-xl text-center text-[13px] md:text-sm text-gray-500 font-light leading-relaxed uppercase tracking-widest">
                        {marketingData.description}
                    </p>
                )}
            </div>

            {/* 2. Marketing Banner */}
            {marketingData?.maketimg?.url && (
                <div className="relative w-full h-[55vh] md:h-[75vh] mb-0 overflow-hidden bg-gray-50">
                    {marketingData.maketimg.mime?.includes("video") ? (
                        <video src={marketingData.maketimg.url} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                        <img src={marketingData.maketimg.url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/10" />
                </div>
            )}

            {/* 3. 【重点】吸顶工具栏：BackButton 驻守左侧 */}
            <div className="sticky top-[56px] lg:top-[64px] z-[40] bg-white/95 backdrop-blur-md">
                <div className="mx-auto px-4 md:px-8">
                    {/* 增加高度和内边距，确保返回键和系列切换对齐 */}
                    <div className="h-24 flex items-end justify-between border-b border-gray-100 pb-4">

                        {/* 左侧：返回键 + 分隔线 + (Result & Collection) */}
                        <div className="flex items-end gap-x-4 md:gap-x-6">
                            {/* 永远固定的返回键 */}
                            <div className="pb-0.5">
                                <BackButton className="text-black !tracking-[0.1em]" />
                            </div>

                            {/* 垂直分割线，增加精致感 */}
                            <div className="h-8 w-[1px] bg-gray-200 mb-1" />

                            <div className="flex flex-col items-start gap-y-1">
                                {/* 数量统计 */}
                                <span className="text-[9px] md:text-[10px] text-gray-400 uppercase tracking-[0.2em] ml-0.5">
                                Showing {collection.products?.length || 0} Results
                            </span>

                                {/* 系列切换/标题 */}
                                <div className="transform translate-y-1">
                                    <CollectionHeader
                                        collection={collection}
                                        collections={collections}
                                        sort={sort}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. 商品列表区域 */}
            <div className="w-full relative z-0 mt-8">
                <div className="px-4 md:px-8 pb-24">
                    <Suspense fallback={
                        <div className="w-full py-12 px-4">
                            <SkeletonProductGrid numberOfProducts={8} />
                        </div>
                    }>
                        <div className="product-grid-clean">
                            <PaginatedProducts
                                sortBy={sort}
                                page={pageNumber}
                                collectionId={collection.id}
                                countryCode={countryCode}
                            />
                        </div>
                    </Suspense>
                </div>
            </div>
        </div>
    )
}