import { notFound } from "next/navigation"
import { Suspense } from "react"

import InteractiveLink from "@modules/common/components/interactive-link"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

export default function CategoryTemplate({
                                             category,
                                             allCategoryIds,
                                             sortBy,
                                             page,
                                             countryCode,
                                         }: {
    category: HttpTypes.StoreProductCategory
    allCategoryIds: string[]
    sortBy?: SortOptions
    page?: string
    countryCode: string
}) {
    const pageNumber = page ? parseInt(page) : 1
    const sort = sortBy || "created_at"

    if (!category || !countryCode) notFound()

    const parents = [] as HttpTypes.StoreProductCategory[]

    const getParents = (category: HttpTypes.StoreProductCategory) => {
        if (category.parent_category) {
            parents.push(category.parent_category)
            getParents(category.parent_category)
        }
    }

    getParents(category)

    return (
        <div className="w-full" data-testid="category-container">
            {/* 顶部区域 */}
            <div className="w-full border-b border-gray-100 bg-white relative z-50">
                <div className="relative py-8 px-4">
                    {/* 面包屑导航 - 已移除 Home */}
                    {parents && parents.length > 0 && (
                        <div className="mb-6">
                            <div className="flex items-center text-sm text-gray-500">
                                {[...parents].reverse().map((parent, index) => (
                                    <div key={parent.id} className="flex items-center">
                                        <LocalizedClientLink
                                            className="hover:text-black transition-colors duration-200"
                                            href={`/categories/${parent.handle}`}
                                            data-testid="sort-by-link"
                                        >
                                            {parent.name}
                                        </LocalizedClientLink>
                                        <span className="mx-2">›</span>
                                    </div>
                                ))}
                                <span className="font-medium text-gray-900">
                  {category.name}
                </span>
                            </div>
                        </div>
                    )}

                    {/* 主要内容区域 */}
                    <div className="relative">
                        {/* 标题居中 */}
                        <div className="text-center">
                            <h1
                                className="text-3xl font-bold tracking-tight text-gray-900"
                                data-testid="category-page-title"
                            >
                                {category.name}
                            </h1>

                            {/*{category.description && (*/}
                            {/*    <p className="mt-3 text-base text-gray-600 max-w-2xl mx-auto">*/}
                            {/*        {category.description}*/}
                            {/*    </p>*/}
                            {/*)}*/}
                        </div>

                        {/* 右侧容器 - 包含子分类和排序 */}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-4">
                            {/* 子分类下拉菜单 */}
                            {category.category_children &&
                            category.category_children.length > 0 && (
                                <div className="relative group">
                                    <button className="flex items-center justify-between gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200 min-w-[140px]">
                                        {/* 显示第一个子分类名称作为标题 */}
                                        <span>{category.category_children[0].name}</span>
                                        <svg
                                            className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 9l-7 7-7-7"
                                            />
                                        </svg>
                                    </button>

                                    {/* 下拉列表 - z-index 设为最高，确保覆盖图片 */}
                                    <div className="absolute top-full right-0 mt-2 py-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100]">
                                        {category.category_children?.map((c) => (
                                            <InteractiveLink
                                                key={c.id}
                                                href={`/categories/${c.handle}`}
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-black"
                                            >
                                                {c.name}
                                            </InteractiveLink>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 排序按钮 */}
                            <div className="relative group">
                                <button className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm">
                                    <span className="tracking-wide text-[11px]">SORT</span>
                                    <svg
                                        className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 9l-7 7-7-7"
                                        />
                                    </svg>
                                </button>

                                {/* 排序弹窗 - z-index 设为最高 */}
                                <div className="absolute top-full right-0 mt-3 py-2 w-48 bg-white border border-gray-200 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100]">
                                    <div className="px-1">
                                        <RefinementList sortBy={sort} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 商品列表区域 - 设置较低 z-index 确保不挡住下拉菜单 */}
            <div className="w-full px-0 relative z-0">
                <Suspense
                    fallback={
                        <div className="w-full py-12">
                            <SkeletonProductGrid
                                numberOfProducts={category.products?.length ?? 8}
                            />
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
    )
}