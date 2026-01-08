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
            <div className="content-container pt-24 md:pt-28 pb-4">
                <BackButton />
            </div>
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


            {/* --- 极简工具栏容器 --- */}
            <div className="sticky top-[60px] lg:top-[80px] z-[40] bg-white/95 backdrop-blur-sm">
                <div className="content-container mx-auto px-4 md:px-8">
                    {/* 1. 高度稍微拉高到 h-20，给两行文字留出呼吸空间 */}
                    <div className="h-20 flex items-end justify-between border-b border-gray-100 pb-3">

                        {/* 左侧：垂直排列 Result 和 Collection */}
                        <div className="flex flex-col items-start gap-y-1">

                            {/* 2. 数量统计：放在最上面，字号再小一点，颜色变浅，产生一种“导语”感 */}
                            <span className="text-[9px] md:text-[10px] text-gray-400 uppercase tracking-[0.2em] ml-0.5">
                    Showing {collection.products?.length || 0} Results
                </span>

                            {/* 3. Collection 切换：放在下面，作为视觉重点 */}
                            <CollectionHeader
                                collection={collection}
                                collections={collections}
                                sort={sort}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. 商品列表区域 */}
            <div className="w-full relative z-0">
                {/* 去掉 content-container，改用 w-full，左右 padding 只留极小 */}
                <div className="px-[1px] md:px-0">
                    <Suspense fallback={
                        <div className="w-full py-12 px-4">
                            <SkeletonProductGrid numberOfProducts={8} />
                        </div>
                    }>
                        {/* 我们在外层包一个 div，强制去掉内部可能存在的卡片样式 */}
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