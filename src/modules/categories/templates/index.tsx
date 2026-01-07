import { notFound } from "next/navigation"
import { Suspense } from "react"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import { HttpTypes } from "@medusajs/types"
import CollectionHeader from "../../collections/collection-header"

export default function CategoryTemplate({
                                             category,
                                             marketingData, // 接收从 Page 传下来的 Strapi 数据
                                             allCategoryIds,
                                             sortBy,
                                             page,
                                             countryCode,
                                         }: {
    category: HttpTypes.StoreProductCategory
    marketingData?: any
    allCategoryIds: string[]
    sortBy?: SortOptions
    page?: string
    countryCode: string
}) {
    const pageNumber = page ? parseInt(page) : 1
    const sort = sortBy || "created_at"

    if (!category || !countryCode) notFound()

    return (
        <div className="w-full bg-white">
            {/* 1. 统一的标题区 */}
            <div className="pt-16 pb-8 flex flex-col items-center px-4">
                {/* 1. 无论如何都显示的分类大标题 */}
                <h1 className="text-[26px] md:text-[36px] font-light uppercase tracking-[0.3em] text-gray-900 mb-3 text-center">
                    {category.name}
                </h1>

                {/* 2. 描述文字逻辑：只要有描述就显示 */}
                {/* 这样改：不管有没有图，只要你在 Strapi 填了描述，标题下面都会有这行优雅的小字 */}
                {marketingData?.description ? (
                    <p className="max-w-2xl text-center text-[13px] md:text-[15px] text-gray-500 font-light leading-relaxed mt-4 px-6 italic">
                        {marketingData.description}
                    </p>
                ) : (
                    /* 如果连描述都没填，才显示这个兜底的小后缀 */
                    <p className="text-[10px] md:text-[12px] text-gray-400 uppercase tracking-[0.2em] font-light">
                        Explore the Series
                    </p>
                )}
            </div>

            {/* 3. 图片区域：独立判断，有图就蹦出来，没图就消失 */}
            {marketingData?.maketimg?.url && (
                <div className="relative w-full h-[50vh] md:h-[70vh] mb-4 overflow-hidden bg-gray-50">
                    {/* 这里放入之前的视频/图片渲染逻辑 */}
                    {marketingData.maketimg.mime?.includes("video") ? (
                        <video src={marketingData.maketimg.url} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                    ) : (
                        <img src={marketingData.maketimg.url} className="w-full h-full object-cover" alt="" />
                    )}

                    {/* 如果有图，描述文字可以叠在图上或者图下方，但我建议大类直接纯净出图 */}
                    <div className="absolute inset-0 bg-black/5" />
                </div>
            )}


            {/* 3. 吸顶工具栏：Results 在上，切换/排序在下 */}
            <div className="sticky top-[60px] lg:top-[80px] z-[40] bg-white/95 backdrop-blur-md border-b border-gray-100">
                <div className="content-container mx-auto px-4 md:px-8 py-4 flex flex-col items-start">
                    {/* 数量统计 */}
                    <span className="text-[9px] text-gray-400 uppercase tracking-[0.2em] mb-1 ml-0.5">
            {/* 如果 PaginatedProducts 有总数可以传出来，这里暂时手动显示内容 */}
                        Explore the Selection
                    </span>

                    {/* 复用 CollectionHeader，把分类信息伪装成 Collection 传进去 */}
                    <CollectionHeader
                        collection={{ title: category.name, id: category.id, handle: category.handle } as any}
                        sort={sort}
                        // 这里不需要传 collections 数组，因为它只显示当前分类名
                    />
                </div>
            </div>

            {/* 4. 商品列表区域：左右铺满布局 */}
            <div className="w-full mt-8">
                <div className="px-[1px] md:px-2">
                    <Suspense
                        fallback={
                            <div className="w-full py-12">
                                <SkeletonProductGrid numberOfProducts={8} />
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
        </div>
    )
}