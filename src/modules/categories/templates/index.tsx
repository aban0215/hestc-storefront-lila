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
            <div className="content-container pt-20 md:pt-24 pb-2">
                <BackButton />
            </div>
            {/* 1. 统一的标题区 */}
            <div className="pt-16 pb-8 flex flex-col items-center px-4">
                <h1 className="text-[26px] md:text-[36px] font-light uppercase tracking-[0.3em] text-gray-900 mb-3 text-center">
                    {category.name}
                </h1>

                {marketingData?.description ? (
                    <p className="max-w-2xl text-center text-[13px] md:text-[15px] text-gray-500 font-light leading-relaxed mt-4 px-6 italic">
                        {marketingData.description}
                    </p>
                ) : (
                    <p className="text-[10px] md:text-[12px] text-gray-400 uppercase tracking-[0.2em] font-light">
                        {/*Explore the Series*/}
                    </p>
                )}
            </div>

            {/* 2. 营销图片/视频区域 */}
            {marketingData?.maketimg?.url && (
                <div className="relative w-full h-[50vh] md:h-[70vh] mb-4 overflow-hidden bg-gray-50">
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
                            alt={category.name}
                        />
                    )}
                    <div className="absolute inset-0 bg-black/5" />
                </div>
            )}

            {/* 3. 吸顶工具栏：Breadcrumbs(左) + Sort(右) */}
            <div className="sticky top-[60px] lg:top-[80px] z-[40] bg-white/95 backdrop-blur-md border-b border-gray-100">
                <div className="w-full px-4 md:px-8 py-5">

                    <span className="text-[9px] text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-0.5">
            {count} {count === 1 ? 'Result' : 'Results'}
          </span>

                    {/* 上方小字提示 */}
                    <div className="flex items-center justify-between w-full">
                        {/* 左侧：面包屑路径 */}
                        <nav className="flex items-center flex-wrap gap-x-2 text-[11px] font-medium tracking-[0.15em] uppercase text-gray-900">
                            <LocalizedClientLink
                                href="/store"
                                className="hover:text-gray-400 transition-colors"
                            >
                                Store
                            </LocalizedClientLink>

                            {breadcrumbs.map((bc, index) => (
                                <div key={bc.handle} className="flex items-center gap-x-2">
                                    <span className="text-gray-300 font-light">/</span>
                                    <LocalizedClientLink
                                        href={`/categories/${bc.handle}`}
                                        className={`${
                                            index === breadcrumbs.length - 1
                                                ? "text-black pointer-events-none"
                                                : "text-gray-400 hover:text-black transition-colors"
                                        }`}
                                    >
                                        {bc.name}
                                    </LocalizedClientLink>
                                </div>
                            ))}
                        </nav>

                        {/* 右侧：排序下拉 (保持和 CollectionHeader 风格一致) */}
                        <div className="relative group">
                            <button className="flex items-center gap-x-2 text-[11px] font-medium tracking-[0.2em] text-gray-900 uppercase group hover:text-gray-500 transition-colors">
                <span className="relative pb-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-black/10 group-hover:after:bg-black after:transition-colors">
                  Sort By
                </span>
                                <svg className="w-3 h-3 transition-transform duration-300 group-hover:rotate-180 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            <div className="absolute top-full right-0 mt-0 py-5 w-48 bg-white shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[100] border-t border-gray-100">
                                <div className="px-6">
                                    <p className="text-[9px] text-gray-400 tracking-widest mb-3">ORDER BY</p>
                                    <RefinementList sortBy={sort} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. 商品列表区域 */}
            <div className="w-full mt-8">
                <div className="px-[1px] md:px-2">
                    <Suspense
                        fallback={
                            <div className="w-full py-12 px-4 md:px-8">
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