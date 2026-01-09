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

export default async function CategoryTemplate(props: {
    category: HttpTypes.StoreProductCategory
    marketingData?: any
    allCategoryIds: string[]
    sortBy?: SortOptions
    page?: string
    countryCode: string
    searchParams: Promise<any> // 明确定义为 Promise
}) {
    // 1. 【核心修复】安全地获取 searchParams
    // 先检查 props 是否存在，再等待 Promise 解析
    const searchParams = props.searchParams ? await props.searchParams : {}

    // 给所有解构值提供默认值，防止解构 undefined 报错
    const {
        material = undefined,
        size = undefined,
        color = undefined,
        collection: collectionHandle = undefined
    } = searchParams || {}

    // 2. 统一处理分页和排序逻辑
    const pageNumber = props.page ? parseInt(props.page) : (searchParams.page ? parseInt(searchParams.page as string) : 1)
    const sort = props.sortBy || (searchParams.sortBy as SortOptions) || "created_at"

    // 3. 获取系列列表（用于翻译 Handle -> ID）
    const { collections = [] } = await listCollections({
        limit: 100
    })

    // 翻译 Handle 为 ID
    const activeCollectionId = collectionHandle
        ? collections.find(c => c.handle === collectionHandle)?.id
        : undefined

    // 4. 获取初始商品数据（用于 FilterMenu 提取维度）
    const {
        response: { products, count },
    } = await listProductsWithSort({
        page: 1,
        queryParams: {
            limit: 100,
            category_id: props.allCategoryIds,
        },
        sortBy: sort,
        countryCode: props.countryCode,
    })

    if (!props.category || !props.countryCode) notFound()

    // 递归获取面包屑
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

    const breadcrumbs = getBreadcrumbs(props.category)

    return (
        <div className="w-full bg-white">
            {/* 营销图片/视频区域 */}
            {props.marketingData?.maketimg?.url && (
                <div className="relative w-full h-[55vh] md:h-[75vh] mb-0 overflow-hidden bg-gray-50">
                    <div className="hidden md:block w-full h-full">
                        {props.marketingData.maketimg.mime?.includes("video") ? (
                            <video
                                src={props.marketingData.maketimg.url}
                                autoPlay loop muted playsInline
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        ) : (
                            <img
                                src={props.marketingData.maketimg.url}
                                className="absolute inset-0 w-full h-full object-cover"
                                alt={props.category.name}
                            />
                        )}
                    </div>
                    <div className="block md:hidden w-full h-full">
                        {props.marketingData.mobileImage?.url ? (
                            <img
                                src={props.marketingData.mobileImage.url}
                                className="absolute inset-0 w-full h-full object-cover"
                                alt={`${props.category.name} mobile`}
                            />
                        ) : (
                            <img
                                src={props.marketingData.maketimg.url}
                                className="absolute inset-0 w-full h-full object-cover"
                                alt={props.category.name}
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

                        {/* 右侧：筛选 + 排序 */}
                        <div className="flex items-center gap-x-6">
                            <FilterWrapper>
                                <FilterMenu
                                    products={products}
                                    collections={collections}
                                />
                            </FilterWrapper>

                            <div className="h-3 w-[1px] bg-gray-200" />

                            <div className="relative group">
                                <button className="flex items-center gap-x-2 text-[10px] font-medium tracking-[0.15em] text-gray-900 uppercase">
                                    <span className="pb-0.5 border-b border-transparent group-hover:border-black transition-all">Sort By</span>
                                    <svg className="w-3 h-3 text-gray-400 transition-transform duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

            {/* 商品列表区域 */}
            <div className="w-full mt-10">
                <div className="px-4 md:px-8 pb-24">
                    {/* 使用独特的 Key 强制 Suspense 在参数变化时显示 Skeleton */}
                    <Suspense
                        key={`${activeCollectionId}-${material}-${size}-${color}-${sort}`}
                        fallback={<SkeletonProductGrid numberOfProducts={8} />}
                    >
                        <PaginatedProducts
                            sortBy={sort}
                            page={pageNumber}
                            categoryId={props.allCategoryIds}
                            countryCode={props.countryCode}
                            collectionId={activeCollectionId}
                            material={material}
                            size={size}
                            color={color}
                        />
                    </Suspense>
                </div>
            </div>
        </div>
    )
}