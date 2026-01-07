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
        <div className="w-full overflow-x-hidden bg-white">
            {/* 1. 顶部系列头：把 CollectionHeader 里的标题去掉，这里统一展示 */}
            <div className="pt-12 pb-6 px-4 md:px-8 flex flex-col items-center">
                <h1 className="text-[28px] md:text-[40px] font-light uppercase tracking-[0.3em] text-gray-900 mb-4">
                    {collection.title}
                </h1>
                {/* 简单的系列说明，增加文人气息 */}
                <p className="max-w-xl text-center text-[13px] md:text-sm text-gray-500 font-light leading-relaxed uppercase tracking-wider">
                    {marketingData?.description}
                </p>
            </div>

            {/* 2. Marketing Banner：去掉厚重的遮罩，改用渐变或纯净排版 */}
            {marketingData && (
                <div className="relative w-full h-[50vh] md:h-[75vh] mb-12 overflow-hidden bg-gray-50">
                    {marketingData.maketimg?.mime?.includes("video") ? (
                        <video src={marketingData.maketimg.url} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                        marketingData.maketimg?.url && (
                            <img src={marketingData.maketimg.url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                        )
                    )}
                    {/* 遮罩改为极其轻微的底部渐变，让画面透出来 */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/20" />
                </div>
            )}

            {/* 3. 筛选工具栏：做成贴地平滑感 */}
            {/*<div className="sticky top-[60px] lg:top-[80px] z-30 bg-white/90 backdrop-blur-md border-y border-gray-100 mb-8">*/}
            {/*    <div className="content-container mx-auto px-4 md:px-8 h-14 flex items-center justify-between">*/}
            {/*        <div className="text-[11px] uppercase tracking-widest text-gray-400">*/}
            {/*            /!* 显示商品数量，增加专业感 *!/*/}
            {/*            Showing {collection.products?.length || 0} Results*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*</div>*/}

            {/* --- 极简工具栏容器 --- */}
            <div className="sticky top-[60px] lg:top-[80px] z-[40] bg-white/95 backdrop-blur-sm">
                <div className="content-container mx-auto px-4 md:px-8">
                    {/* 只保留底部一条极细的灰线，去掉顶部的线 */}
                    <div className="h-16 flex items-end justify-between border-b border-gray-100 pb-2">

                        {/* 左侧：Collection 切换 + 数量统计 (合二为一) */}
                        <div className="flex items-center gap-x-8">
                            <CollectionHeader
                                collection={collection}
                                collections={collections}
                                sort={sort}
                                renderType="collection-only" // 告诉组件只渲染左边
                            />
                            {/* 数量统计：用更浅的颜色，更小的字号 */}
                            <span className="hidden md:block text-[10px] text-gray-400 uppercase tracking-[0.2em] mb-1">
                    {collection.products?.length || 0} Results
                </span>
                        </div>

                        {/* 右侧：排序 */}
                        {/*<div className="mb-1">*/}
                        {/*    <CollectionHeader*/}
                        {/*        collection={collection}*/}
                        {/*        collections={collections}*/}
                        {/*        sort={sort}*/}
                        {/*        renderType="sort-only" // 告诉组件只渲染右边*/}
                        {/*    />*/}
                        {/*</div>*/}
                    </div>
                </div>
            </div>

            {/* 4. 商品列表区域 */}
            <div className="content-container mx-auto px-4 md:px-8 relative z-0">
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