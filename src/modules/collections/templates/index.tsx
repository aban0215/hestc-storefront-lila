import { Suspense } from "react"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { HttpTypes } from "@medusajs/types"
import CollectionHeader from "../collection-header/index"
import BackButton from "@modules/account/components/back-button";
import RefinementList from "@modules/store/components/refinement-list";

// 引入获取筛选数据的逻辑和组件
import { getFacetSnapshot } from "@lib/data/facets"
import DynamicFilters from "../../../app/components/dynamic-filters";

export default async function CollectionTemplate({
                                                     sortBy,
                                                     collection,
                                                     collections,
                                                     page,
                                                     countryCode,
                                                     marketingData,
                                                     searchParams,
                                                 }: {
    sortBy?: SortOptions
    collection: HttpTypes.StoreCollection
    collections?: HttpTypes.StoreCollection[]
    page?: string
    countryCode: string
    marketingData?: any
    searchParams?: any
}) {
    const pageNumber = page ? parseInt(page) : 1
    const sort = sortBy || "created_at"

    // 1. 获取该系列下的动态属性快照 (基于 Collection ID)
    const facets = await getFacetSnapshot(collection.id)

    return (
        <div className="w-full bg-white relative">
            {/* 1. 吸顶工具栏 */}
            <div className="sticky top-[55px] lg:top-[80px] z-[50] bg-white border-b border-gray-100 w-full">
                <div className="mx-auto px-4 md:px-8 py-4">
                    {/* 数量统计 */}
                    <span className="text-[9px] text-gray-400 uppercase tracking-[0.2em] mb-3 block ml-0.5">
                        {collection.products?.length || 0} {collection.products?.length === 1 ? 'Result' : 'Results'}
                    </span>

                    <div className="flex items-center justify-between w-full">
                        {/* 左侧：返回键 + 分隔线 + 系列切换 */}
                        <div className="flex items-center gap-x-4">
                            <div className="flex-shrink-0">
                                <BackButton className="text-black !tracking-[0.1em]" />
                            </div>

                            {/*<div className="h-4 w-[1px] bg-gray-200 flex-shrink-0" />*/}

                            {/*<div className="flex items-center">*/}
                            {/*    <CollectionHeader*/}
                            {/*        collection={collection}*/}
                            {/*        collections={collections}*/}
                            {/*        sort={sort}*/}
                            {/*    />*/}
                            {/*</div>*/}
                        </div>

                        {/* 右侧：筛选 + 排序 */}
                        <div className="flex items-center gap-x-6">
                            {/* A. 筛选按钮 - 逻辑与 Category 保持完全一致 */}
                            {facets && facets.dynamic_options?.length > 0 && (
                                <div className="relative group">
                                    <button className="flex items-center gap-x-2 text-[10px] font-medium tracking-[0.15em] text-gray-900 uppercase">
                                        <span className="pb-0.5 border-b border-transparent group-hover:border-black transition-all">Filter</span>
                                        <svg
                                            className="w-3.5 h-3.5 text-gray-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={1.2}
                                                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                                            />
                                        </svg>
                                    </button>
                                    {/* 下拉筛选框 */}
                                    <div className="absolute top-full right-0 mt-0 py-8 w-[280px] sm:w-[320px] bg-white shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[100] border border-gray-100">
                                        <div className="px-8 max-h-[60vh] overflow-y-auto no-scrollbar">
                                            <DynamicFilters facets={facets} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 分隔点 */}
                            <div className="h-3 w-[1px] bg-gray-200 hidden md:block" />

                            {/* B. 排序下拉 */}
                            <div className="relative group flex-shrink-0">
                                <button className="flex items-center gap-x-2 text-[10px] font-medium tracking-[0.15em] text-gray-900 uppercase">
                                    <span className="pb-0.5 border-b border-transparent group-hover:border-black transition-all">
                                        Sort By
                                    </span>
                                    <svg
                                        className="w-3 h-3 text-gray-400 transition-transform duration-300 group-hover:rotate-180"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                <div className="absolute top-full right-0 mt-0 py-5 w-48 bg-white shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[100] border border-gray-100">
                                    <div className="px-6">
                                        <RefinementList sortBy={sort} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Marketing Banner */}
            {marketingData?.maketimg?.url && (
                <div className="relative w-full h-[55vh] md:h-[75vh] mb-0 overflow-hidden bg-gray-50">

                    {/* 桌面端视图 (md 以上显示) */}
                    <div className="hidden md:block w-full h-full">
                        {marketingData.maketimg.mime?.includes("video") ? (
                            <video
                                src={marketingData.maketimg.url}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        ) : (
                            <img
                                src={marketingData.maketimg.url}
                                className="absolute inset-0 w-full h-full object-cover"
                                alt={collection.name}
                            />
                        )}
                    </div>

                    {/* 移动端视图 (md 以下显示) */}
                    <div className="block md:hidden w-full h-full">
                        {/* 优先判断 mobileImage 是否为视频，如果移动端也可能传视频的话 */}
                        {marketingData.mobileImage?.mime?.includes("video") ? (
                            <video
                                src={marketingData.mobileImage.url}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        ) : (
                            <img
                                /* 逻辑：有移动端图用移动端图，没有则回退使用桌面端图 */
                                src={marketingData.mobileImage?.url || marketingData.maketimg.url}
                                className="absolute inset-0 w-full h-full object-cover"
                                alt={collection.name}
                            />
                        )}
                    </div>

                    {/* 遮罩层 */}
                    <div className="absolute inset-0 bg-black/5" />
                </div>
            )}




            {/* 3. 商品列表区域 */}
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
                                searchParams={searchParams}
                            />
                        </div>
                    </Suspense>
                </div>
            </div>
        </div>
    )
}