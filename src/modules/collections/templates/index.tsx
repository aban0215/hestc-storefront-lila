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
            {/* 1. 标题区 */}
            <div className="pt-24 md:pt-32 pb-12 flex flex-col items-center px-4">
                <h1 className="text-[26px] md:text-[38px] font-light uppercase tracking-[0.25em] text-gray-900 mb-3 text-center leading-tight">
                    {collection.title}
                </h1>
                {marketingData?.description && (
                    <p className="max-w-2xl text-center text-[13px] md:text-[14px] text-gray-500 font-light leading-relaxed mt-4 px-6 italic">
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
                        <img src={marketingData.maketimg.url} className="absolute inset-0 w-full h-full object-cover" alt={collection.title} />
                    )}
                    <div className="absolute inset-0 bg-black/5" />
                </div>
            )}

            {/* 3. 【严格复刻版】吸顶工具栏 */}
            <div className="sticky top-[56px] lg:top-[64px] z-[40] bg-white/95 backdrop-blur-md border-b border-gray-100">
                <div className="w-full px-4 md:px-8 py-4">
                    {/* 结果数量提示 - 独立在上方 */}
                    <span className="text-[9px] text-gray-400 uppercase tracking-[0.2em] mb-3 block ml-0.5">
                    {collection.products?.length || 0} {collection.products?.length === 1 ? 'Result' : 'Results'}
                </span>

                    {/* 左右对齐的容器 */}
                    <div className="flex items-center justify-between w-full">

                        {/* --- 左侧区域：Back + 线 + 下拉框 --- */}
                        <div className="flex items-center gap-x-4">
                            {/* 返回键 */}
                            <BackButton className="text-black !tracking-[0.1em]" />

                            {/* 分隔线 */}
                            <div className="h-3 w-[1px] bg-gray-200" />

                            {/* Collection 下拉选择器 - 强制在一行显示 */}
                            <div className="flex items-center">
                                <CollectionHeader
                                    collection={collection}
                                    collections={collections}
                                    sort={sort}
                                />
                            </div>
                        </div>

                        {/* --- 右侧区域：排序 --- */}
                        <div className="relative group">
                            <button className="flex items-center gap-x-2 text-[10px] font-medium tracking-[0.15em] text-gray-900 uppercase">
                                <span className="pb-0.5">Sort By</span>
                                <svg className="w-3 h-3 text-gray-400 transition-transform duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            <div className="absolute top-full right-0 mt-0 py-5 w-48 bg-white shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[100] border border-gray-100">
                                <div className="px-6">
                                    <p className="text-[9px] text-gray-400 tracking-widest mb-3 uppercase">Order By</p>
                                    <RefinementList sortBy={sort} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. 商品列表 */}
            <div className="w-full mt-10">
                <div className="px-4 md:px-8 pb-24">
                    <Suspense fallback={<div className="w-full py-12 px-4"><SkeletonProductGrid numberOfProducts={8} /></div>}>
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