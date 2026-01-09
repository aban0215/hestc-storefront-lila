import { notFound } from "next/navigation"
import { Suspense } from "react"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import RefinementList from "@modules/store/components/refinement-list"
import { listProductsWithSort } from "@lib/data/products"
import { listCollections } from "@lib/data/collections" // 确保你有这个获取集合的 helper
import BackButton from "@modules/account/components/back-button"
import FilterWrapper from "@modules/categories/templates/filterwrapper"
import FilterMenu from "@modules/categories/templates/filterwrapper/FilterMenu"

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
    searchParams: any
}) {
    const { material, size, color, collection } = searchParams
    const pageNumber = page ? parseInt(page) : 1
    const sort = sortBy || "created_at"

    const {
        response: { products, count },
    } = await listProductsWithSort({
        page: 1,
        queryParams: {
            limit: 100, // 数量管够，确保 Size/Color 提取完整
            category_id: allCategoryIds,
        },
        sortBy: sort,
        countryCode,
    })

    const { collections } = await listCollections({
        limit: 100
    })

    if (!category || !countryCode) notFound()

    // 核心逻辑：递归获取面包屑
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
            {/* 营销图片区域 */}
            {marketingData?.maketimg?.url && (
                <div className="relative w-full h-[55vh] md:h-[75vh] mb-0 overflow-hidden bg-gray-50">
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
                                alt={category.name}
                            />
                        )}
                    </div>
                    <div className="block md:hidden w-full h-full">
                        {marketingData.mobileImage?.url ? (
                            <img
                                src={marketingData.mobileImage.url}
                                className="absolute inset-0 w-full h-full object-cover"
                                alt={`${category.name} mobile`}
                            />
                        ) : (
                            <img
                                src={marketingData.maketimg.url}
                                className="absolute inset-0 w-full h-full object-cover"
                                alt={category.name}
                            />
                        )}
                    </div>
                    <div className="absolute inset-0 bg-black/5" />
                </div>
            )}

            {/* 吸顶工具栏 */}
            <div className="sticky top-[56px] lg:top-[64px] z-[40] bg-white/95 backdrop-blur-md border-b border-gray-100">
                <div className="w-full px-4 md:px-8 py-4">
          <span className="text-[9px] text-gray-400 uppercase tracking-[0.2em] mb-3 block ml-0.5">
            {count} {count === 1 ? "Result" : "Results"}
          </span>

                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-x-4">
                            <BackButton className="text-black !tracking-[0.1em]" />
                            <div className="h-3 w-[1px] bg-gray-200 hidden sm:block" />
                            <nav className="hidden sm:flex items-center gap-x-2 text-[10px] font-medium tracking-[0.1em] uppercase text-gray-900">
                                <LocalizedClientLink
                                    href="/store"
                                    className="text-gray-400 hover:text-black transition-colors"
                                >
                                    Store
                                </LocalizedClientLink>
                                {breadcrumbs.map((bc, index) => (
                                    <div key={bc.handle} className="flex items-center gap-x-1.5">
                                        <span className="text-gray-300">/</span>
                                        <LocalizedClientLink
                                            href={`/categories/${bc.handle}`}
                                            className={
                                                index === breadcrumbs.length - 1
                                                    ? "text-black pointer-events-none"
                                                    : "text-gray-400 hover:text-black"
                                            }
                                        >
                                            {bc.name}
                                        </LocalizedClientLink>
                                    </div>
                                ))}
                            </nav>
                        </div>

                        {/* 右侧：筛选 + 分隔线 + 排序 */}
                        <div className="flex items-center gap-x-6">
                            <FilterWrapper>
                                <FilterMenu
                                    products={products} // 传入获取到的商品数据
                                    collections={collections} // 传入所有系列数据
                                />
                            </FilterWrapper>

                            <div className="h-3 w-[1px] bg-gray-200" />

                            <div className="relative group">
                                <button className="flex items-center gap-x-2 text-[10px] font-medium tracking-[0.15em] text-gray-900 uppercase">
                                    <span className="pb-0.5 border-b border-transparent group-hover:border-black transition-all">Sort By</span>
                                    <svg
                                        className="w-3 h-3 text-gray-400 transition-transform duration-300 group-hover:rotate-180"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.5}
                                            d="M19 9l-7 7-7-7"
                                        />
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

            {/* 商品列表区域 */}
            <div className="w-full mt-10">
                <div className="px-4 md:px-8 pb-24">
                    <Suspense fallback={<SkeletonProductGrid numberOfProducts={8} />}>
                        <PaginatedProducts
                            sortBy={sort}
                            page={pageNumber}
                            categoryId={allCategoryIds}
                            countryCode={countryCode}
                            material={material}
                            size={size}
                            color={color}
                            collectionHandle={collection}
                        />
                    </Suspense>
                </div>
            </div>
        </div>
    )
}