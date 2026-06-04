import { notFound } from "next/navigation"
import { Suspense } from "react"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import RefinementList from "@modules/store/components/refinement-list"
import { listProductsWithSort } from "@lib/data/products"
import BackButton from "@modules/account/components/back-button"

import { getFacetSnapshot } from "@lib/data/facets"
import DynamicFilters from "../../../app/components/dynamic-filters";

export default async function CategoryTemplate({
                                                   category,
                                                   marketingData,
                                                   allCategoryIds,
                                                   sortBy,
                                                   page,
                                                   countryCode,
                                                   searchParams,
                                               }: {
    category: HttpTypes.StoreProductCategory
    marketingData?: any
    allCategoryIds: string[]
    sortBy?: SortOptions
    page?: string
    countryCode: string
    searchParams?: any
}) {
    const pageNumber = page ? parseInt(page) : 1
    const sort = sortBy || "created_at"

    // 1. 获取商品总数用于结果提示
    let count = 0
    try {
      const result = await listProductsWithSort({
        page: 1,
        queryParams: {
          limit: 1,
          category_id: allCategoryIds
        },
        sortBy: sort,
        countryCode,
      })
      count = result.response.count
    } catch (e: any) {
      console.error("Failed to count products for category:", category.handle, e)
    }

    // 2. 获取 MeiliSearch 里的动态属性快照
    let facets = null
    try {
      facets = await getFacetSnapshot(category.id)
    } catch (e) {
      console.error("Failed to get facet snapshot:", e)
    }



    if (!category || !countryCode) notFound()

    // --- 面包屑递归逻辑 ---
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
            {/* 1. 吸顶工具栏：实色、无模糊、物理对齐 */}
            <div className="sticky top-12 lg:top-14 z-[50] bg-white border-b border-gray-100">
                <div className="w-full px-4 md:px-8 py-4">
                <span className="text-[9px] text-gray-400 uppercase tracking-[0.2em] mb-3 block ml-0.5">
                    {count} {count === 1 ? 'Result' : 'Results'}
                </span>

                    <div className="flex items-center justify-between w-full">
                        {/* 左侧：返回键 + 面包屑 */}
                        <div className="flex items-center gap-x-4">
                            <BackButton className="text-black !tracking-[0.1em]" />
                            <div className="h-3 w-[1px] bg-gray-200 hidden sm:block" />
                            <nav className="hidden sm:flex items-center gap-x-2 text-[10px] font-medium tracking-[0.1em] uppercase text-gray-900">
                                <LocalizedClientLink href="/store" className="text-gray-400 hover:text-black transition-colors">
                                    Store
                                </LocalizedClientLink>
                                {breadcrumbs.map((bc, index) => (
                                    <div key={bc.handle} className="flex items-center gap-x-1.5">
                                        <span className="text-gray-300">/</span>
                                        <LocalizedClientLink
                                            href={`/categories/${bc.handle}`}
                                            className={index === breadcrumbs.length - 1 ? "text-black pointer-events-none" : "text-gray-400 hover:text-black"}
                                        >
                                            {bc.name}
                                        </LocalizedClientLink>
                                    </div>
                                ))}
                            </nav>
                        </div>

                        {/* 右侧：Filter + Sort By */}
                        <div className="flex items-center gap-x-6 md:gap-x-10">
                            {facets && facets.dynamic_options?.length > 0 && (
                                <div className="relative group">
                                    <button className="flex items-center gap-x-2 text-[10px] font-medium tracking-[0.15em] text-gray-900 uppercase">
                                        <span className="pb-0.5 border-b border-transparent group-hover:border-black transition-all">Filter</span>
                                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                        </svg>
                                    </button>
                                    <div className="absolute top-full right-0 mt-0 py-8 w-[280px] sm:w-[320px] bg-white shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[100] border border-gray-100">
                                        <div className="px-8 max-h-[60vh] overflow-y-auto no-scrollbar">
                                            <DynamicFilters facets={facets} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="relative group">
                                <button className="flex items-center gap-x-2 text-[10px] font-medium tracking-[0.15em] text-gray-900 uppercase">
                                    <span className="pb-0.5 border-b border-transparent group-hover:border-black transition-all">Sort By</span>
                                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

            {/* 2. 营销图片/视频区域 */}
            {marketingData?.image?.url && (
                <div className="relative w-full h-[55vh] md:h-[75vh] mb-0 overflow-hidden bg-gray-50">
                    <div className="hidden md:block w-full h-full">
                        {marketingData.image.mime?.includes("video") ? (
                            <video
                                src={marketingData.image.url}
                                autoPlay loop muted playsInline
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        ) : (
                            <img
                                src={marketingData.image.url}
                                className="absolute inset-0 w-full h-full object-cover"
                                alt={category.name}
                            />
                        )}
                    </div>
                    <div className="block md:hidden w-full h-full">
                        <img
                            src={marketingData.mobileImage?.url || marketingData.image.url}
                            className="absolute inset-0 w-full h-full object-cover"
                            alt={category.name}
                        />
                    </div>
                    <div className="absolute inset-0 bg-black/5" />
                </div>
            )}

            {/* 3. 商品列表区域 */}
            <div className="w-full mt-10">
                <div className="px-4 md:px-8 pb-24">
                    <Suspense fallback={<SkeletonProductGrid numberOfProducts={8} />}>
                        <PaginatedProducts
                            sortBy={sort}
                            page={pageNumber}
                            categoryId={allCategoryIds}
                            countryCode={countryCode}
                            searchParams={searchParams}
                        />
                    </Suspense>
                </div>
            </div>
        </div>
    )
}