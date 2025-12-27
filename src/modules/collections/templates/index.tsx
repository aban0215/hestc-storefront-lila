import { Suspense } from "react"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

export default function CollectionTemplate({
                                               sortBy,
                                               collection,
                                               collections,
                                               page,
                                               countryCode,
                                           }: {
    sortBy?: SortOptions
    collection: HttpTypes.StoreCollection
    collections?: HttpTypes.StoreCollection[]
    page?: string
    countryCode: string
}) {
    const pageNumber = page ? parseInt(page) : 1
    const sort = sortBy || "created_at"

    return (
        <div className="w-full overflow-x-hidden">
            {/* 顶部区域 - 确保 z-50 */}
            <div className="w-full border-b border-gray-100 bg-white relative z-50">
                <div className="relative flex items-center justify-center py-8 px-4">

                    <div className="text-center">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                            {collection.title}
                        </h1>
                    </div>

                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">

                        {/* COLLECTIONS 下拉框 */}
                        {collections && collections.length > 0 && (
                            <div className="relative group">
                                <button className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm min-w-[160px] justify-between">
                                    {/* 核心改动：默认显示当前 collection 的 title */}
                                    <span className="tracking-wide uppercase text-[11px] truncate mr-2">
                    {collection.title}
                  </span>
                                    <svg className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* 浮窗 */}
                                <div className="absolute top-full right-0 mt-2 py-2 w-56 bg-white border border-gray-200 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100]">
                                    {/* 隐形连接层 */}
                                    <div className="absolute -top-2 left-0 right-0 h-2 bg-transparent" />

                                    <div className="max-h-[300px] overflow-y-auto px-1">
                                        {collections.map((c) => (
                                            <LocalizedClientLink
                                                key={c.id}
                                                href={`/collections/${c.handle}`}
                                                className={`block px-4 py-2.5 text-[11px] uppercase tracking-wider rounded-lg transition-colors ${
                                                    c.id === collection.id
                                                        ? "bg-gray-100 text-pink-600 font-bold"
                                                        : "text-gray-500 hover:bg-gray-50 hover:text-black"
                                                }`}
                                            >
                                                {c.title}
                                            </LocalizedClientLink>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SORT 排序按钮 */}
                        <div className="relative group">
                            <button className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm">
                                <span className="tracking-wide text-[11px]">SORT</span>
                                <svg className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            <div className="absolute top-full right-0 mt-2 py-2 w-48 bg-white border border-gray-200 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100]">
                                <div className="absolute -top-2 left-0 right-0 h-2 bg-transparent" />
                                <div className="px-1">
                                    <RefinementList sortBy={sort} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full px-0 relative z-0">
                <Suspense fallback={<div className="w-full py-12"><SkeletonProductGrid numberOfProducts={8} /></div>}>
                    <PaginatedProducts sortBy={sort} page={pageNumber} collectionId={collection.id} countryCode={countryCode} />
                </Suspense>
            </div>
        </div>
    )
}