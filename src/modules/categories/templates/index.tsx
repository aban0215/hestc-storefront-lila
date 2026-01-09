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
import FilterWrapper from "@modules/categories/templates/FilterWrapper";


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
            {/* 1. 标题区：保持呼吸感，但不再单独放 BackButton */}
            {/*<div className="pt-24 md:pt-32 pb-12 flex flex-col items-center px-4">*/}
            {/*    <h1 className="text-[26px] md:text-[38px] font-light uppercase tracking-[0.25em] text-gray-900 mb-3 text-center leading-tight">*/}
            {/*        {category.name}*/}
            {/*    </h1>*/}
            {/*    {marketingData?.description && (*/}
            {/*        <p className="max-w-2xl text-center text-[13px] md:text-[14px] text-gray-500 font-light leading-relaxed mt-4 px-6 italic">*/}
            {/*            {marketingData.description}*/}
            {/*        </p>*/}
            {/*    )}*/}
            {/*</div>*/}

            {/* 2. 营销图片/视频区域 */}
            {marketingData?.maketimg?.url && (
                <div className="relative w-full h-[55vh] md:h-[75vh] mb-0 overflow-hidden bg-gray-50">
                    {/* 1. PC 端显示 (md 以上) */}
                    <div className="hidden md:block w-full h-full">
                        {marketingData.maketimg.mime?.includes("video") ? (
                            <video
                                src={marketingData.maketimg.url}
                                autoPlay loop muted playsInline
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        ) : (
                            <img
                                src={marketingData.maketimg.url}
                                className="absolute inset-0 w-full h-full object-cover"
                                alt={category.name}
                            />
                        )}
                    </div>

                    {/* 2. 移动端显示 (md 以下) */}
                    <div className="block md:hidden w-full h-full">
                        {/* 如果有专门的移动端图就用 mobileImage，没有就保底用原图 */}
                        {marketingData.mobileImage?.url ? (
                            <img
                                src={marketingData.mobileImage.url}
                                className="absolute inset-0 w-full h-full object-cover"
                                alt={`${category.name} mobile`}
                            />
                        ) : (
                            /* 保底逻辑：如果后台没传手机图，依然显示原图，防止白屏 */
                            <img
                                src={marketingData.maketimg.url}
                                className="absolute inset-0 w-full h-full object-cover"
                                alt={category.name}
                            />
                        )}
                    </div>

                    {/* 蒙层：统一的质感滤镜 */}
                    <div className="absolute inset-0 bg-black/5" />
                </div>
            )}

            {/* 3. 【重点】吸顶工具栏：现在 BackButton 就在这里面 */}
            <div className="sticky top-[56px] lg:top-[64px] z-[40] bg-white/95 backdrop-blur-md border-b border-gray-100">
                <div className="w-full px-4 md:px-8 py-4">
                    {/* 结果数量提示 */}
                    <span className="text-[9px] text-gray-400 uppercase tracking-[0.2em] mb-3 block ml-0.5">
                    {count} {count === 1 ? 'Result' : 'Results'}
                </span>

                    <div className="flex items-center justify-between w-full">
                        {/* 左侧：返回键 + 面包屑 融合体 */}
                        <div className="flex items-center gap-x-4">
                            {/* 手机端和电脑端都永远存在的返回键 */}
                            <BackButton className="text-black !tracking-[0.1em]" />

                            <div className="h-3 w-[1px] bg-gray-200 hidden sm:block" /> {/* 分隔线 */}

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


                        <FilterWrapper>
                            {/* 这里以后放 FilterMenu */}
                        </FilterWrapper>

                        <div className="h-3 w-[1px] bg-gray-200" />

                        {/* 右侧：排序 */}
                        <div className="relative group">
                            <button className="flex items-center gap-x-2 text-[10px] font-medium tracking-[0.15em] text-gray-900 uppercase">
                                <span className="pb-0.5">Sort By</span>
                                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            <div className="absolute top-full right-0 mt-0 py-5 w-48 bg-white shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[100] border border-gray-100">
                                <div className="px-6">
                                    {/*<p className="text-[9px] text-gray-400 tracking-widest mb-3 uppercase">Order By</p>*/}
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