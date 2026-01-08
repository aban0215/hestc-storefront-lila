import { Suspense } from "react"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { HttpTypes } from "@medusajs/types"
import CollectionHeader from "../collection-header/index"
import BackButton from "@modules/account/components/back-button";
import RefinementList from "@modules/store/components/refinement-list";

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
            {/* 1. 顶部标题区：保持大品牌呼吸感 */}
            <div className="pt-24 md:pt-32 pb-12 px-4 md:px-8 flex flex-col items-center">
                <h1 className="text-[28px] md:text-[40px] font-light uppercase tracking-[0.3em] text-gray-900 mb-6 text-center">
                    {collection.title}
                </h1>
                {marketingData?.description && (
                    <p className="max-w-xl text-center text-[13px] md:text-sm text-gray-500 font-light leading-relaxed uppercase tracking-widest px-6">
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
                    <div className="absolute inset-0 bg-black/5" />
                </div>
            )}

            {/* 3. 【核心修改】吸顶工具栏：左右天平布局 */}
            <div className="sticky top-[56px] lg:top-[64px] z-[40] bg-white/95 backdrop-blur-md border-b border-gray-100">
                <div className="mx-auto px-4 md:px-8 py-4">

                    {/* 数量统计：作为顶部微型标签 */}
                    <span className="text-[9px] text-gray-400 uppercase tracking-[0.2em] mb-3 block ml-0.5">
                    {collection.products?.length || 0} {collection.products?.length === 1 ? 'Result' : 'Results'}
                </span>

                    <div className="flex items-center justify-between w-full">

                        {/* --- 左侧：返回键 + 分隔线 + 系列选择 --- */}
                        <div className="flex items-center gap-x-3 md:gap-x-5">
                            <BackButton className="text-black !tracking-[0.1em]" />

                            <div className="h-4 w-[1px] bg-gray-200" /> {/* 分隔线 */}

                            {/* Collection 下拉选择器 */}
                            <div className="transform translate-y-[1px]">
                                <CollectionHeader
                                    collection={collection}
                                    collections={collections}
                                    sort={sort}
                                />
                            </div>
                        </div>

                        {/* --- 右侧：排序下拉 (与 Category 完全一致) --- */}
                        <div className="relative group">
                            <button className="flex items-center gap-x-2 text-[10px] font-medium tracking-[0.15em] text-gray-900 uppercase">
                            <span className="pb-0.5 border-b border-transparent group-hover:border-black transition-all">
                                Sort By
                            </span>
                                <svg className="w-3 h-3 text-gray-400 transition-transform duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            <div className="absolute top-full right-0 mt-0 py-5 w-48 bg-white shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[100] border border-gray-100">
                                <div className="px-6">
                                    <p className="text-[9px] text-gray-400 tracking-widest mb-3 uppercase">ORDER BY</p>
                                    <RefinementList sortBy={sort} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. 商品列表区域 */}
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