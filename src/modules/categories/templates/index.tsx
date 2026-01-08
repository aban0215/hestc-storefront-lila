import { notFound } from "next/navigation"
import { Suspense } from "react"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import RefinementList from "@modules/store/components/refinement-list"
import { listProductsWithSort } from "@lib/data/products"
import BackButton from "@modules/account/components/back-button";

export default async function CategoryTemplate({
                                             category,
                                             marketingData,
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

    const { response: { count } } = await listProductsWithSort({
        page: 1,
        queryParams: {
            limit: 1,
            category_id: allCategoryIds
        },
        sortBy: sort,
        countryCode,
    })

    if (!category || !countryCode) notFound()

    // --- 核心逻辑：递归获取面包屑路径 ---
    const getBreadcrumbs = (
        cat: HttpTypes.StoreProductCategory,
        acc: Array<{ name: string; handle: string }> = []
    ) => {
        const current = { name: cat.name, handle: cat.handle }
        const newAcc = [current, ...acc]
        if (cat.parent_category) {
            return getBreadcrumbs(cat.parent_category as any, newAcc)
        }
        return newAcc
    }

    const breadcrumbs = getBreadcrumbs(category)

    return (
        <div className="w-full bg-white">
            {/* 1. 顶部返回区域：紧贴导航栏，作为页面第一个交互点 */}
            <div className="content-container pt-20 md:pt-24 pb-4">
                <BackButton />
            </div>

            {/* 2. 统一的标题区：pt 缩小，让视觉重心快速下移 */}
            <div className="pb-12 flex flex-col items-center px-4">
                <h1 className="text-[26px] md:text-[38px] font-light uppercase tracking-[0.25em] text-gray-900 mb-3 text-center leading-tight">
                    {category.name}
                </h1>

                {marketingData?.description ? (
                    <p className="max-w-2xl text-center text-[13px] md:text-[14px] text-gray-500 font-light leading-relaxed mt-4 px-6 italic">
                        {marketingData.description}
                    </p>
                ) : (
                    <div className="h-4" /> // 保持间距的一致性
                )}
            </div>

            {/* 3. 营销图片/视频区域：增加圆角或全屏感 */}
            {marketingData?.maketimg?.url && (
                <div className="relative w-full h-[55vh] md:h-[75vh] mb-8 overflow-hidden bg-gray-50">
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
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
                            alt={category.name}
                        />
                    )}
                    <div className="absolute inset-0 bg-black/5" />
                </div>
            )}

            {/* 4. 吸顶工具栏：针对手机端优化，与 BackButton 错开层级 */}
            <div className="sticky top-[56px] lg:top-[64px] z-[40] bg-white/95 backdrop-blur-md border-b border-gray-100">
                <div className="w-full px-4 md:px-8 py-4">
                    {/* 结果数量提示 */}
                    <span className="text-[9px] text-gray-400 uppercase tracking-[0.2em] mb-3 block ml-0.5">
                    {count} {count === 1 ? 'Result' : 'Results'}
                </span>

                    <div className="flex items-center justify-between w-full">
                        {/* 左侧：面包屑路径 - 精简字体 */}
                        <nav className="flex items-center flex-wrap gap-x-2 text-[10px] font-medium tracking-[0.1em] uppercase text-gray-900">
                            <LocalizedClientLink
                                href="/store"
                                className="hover:text-gray-400 transition-colors"
                            >
                                Store
                            </LocalizedClientLink>

                            {breadcrumbs.map((bc, index) => (
                                <div key={bc.handle} className="flex items-center gap-x-1.5">
                                    <span className="text-gray-300">/</span>
                                    <LocalizedClientLink
                                        href={`/categories/${bc.handle}`}
                                        className={`${
                                            index === breadcrumbs.length - 1
                                                ? "text-black pointer-events-none"
                                                : "text-gray-400 hover:text-black"
                                        }`}
                                    >
                                        {bc.name}
                                    </LocalizedClientLink>
                                </div>
                            ))}
                        </nav>

                        {/* 右侧：排序 */}
                        <div className="relative group">
                            <button className="flex items-center gap-x-2 text-[10px] font-medium tracking-[0.15em] text-gray-900 uppercase">
                            <span className="pb-0.5 border-b border-transparent group-hover:border-black transition-all">
                                Sort By
                            </span>
                                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {/* 下拉菜单保持不变 */}
                            <div className="absolute top-full right-0 mt-0 py-5 w-48 bg-white shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[100] border border-gray-100">
                                <div className="px-6">
                                    <p className="text-[9px] text-gray-400 tracking-widest mb-3">ORDER BY</p>
                                    <RefinementList sortBy={sort} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 5. 商品列表区域 */}
            <div className="w-full mt-10">
                <div className="px-4 md:px-8">
                    <Suspense fallback={<SkeletonProductGrid numberOfProducts={8} />}>
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