"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import InteractiveLink from "@modules/common/components/interactive-link"
import RefinementList from "@modules/store/components/refinement-list"
import { HttpTypes } from "@medusajs/types"

export default function CategoryHeader({
                                           category,
                                           parents,
                                           sort
                                       }: {
    category: HttpTypes.StoreProductCategory
    parents: HttpTypes.StoreProductCategory[]
    sort: string
}) {
    return (
        <div className="w-full border-b border-gray-100 bg-white relative z-50">
            <div className="max-w-[1440px] mx-auto px-4 py-6 md:py-8 flex flex-col gap-4">

                {/* 1. 面包屑 - 手机端也可见，自动折行 */}
                {parents && parents.length > 0 && (
                    <div className="flex flex-wrap items-center text-[10px] md:text-xs uppercase tracking-widest text-gray-400 justify-center md:justify-start">
                        {[...parents].reverse().map((parent) => (
                            <div key={parent.id} className="flex items-center">
                                <LocalizedClientLink
                                    className="hover:text-black transition-colors"
                                    href={`/categories/${parent.handle}`}
                                >
                                    {parent.name}
                                </LocalizedClientLink>
                                <span className="mx-2">›</span>
                            </div>
                        ))}
                        <span className="text-gray-900 font-bold">{category.name}</span>
                    </div>
                )}

                {/* 2. 主体响应式布局 */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    {/* 标题 */}
                    <div className="text-center md:text-left flex-1">
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 uppercase">
                            {category.name}
                        </h1>
                    </div>

                    {/* 按钮交互区 */}
                    <div className="flex items-center justify-center md:justify-end gap-2 md:gap-4">
                        {/* 子分类下拉 */}
                        {category.category_children && category.category_children.length > 0 && (
                            <div className="relative group">
                                <button className="flex items-center justify-between gap-2 px-4 py-2 md:py-2.5 text-[11px] font-bold text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-all shadow-sm min-w-[140px] md:min-w-[160px]">
                                    <span className="truncate uppercase">{category.category_children[0].name}</span>
                                    <svg className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                <div className="absolute top-full right-1/2 translate-x-1/2 md:translate-x-0 md:right-0 mt-2 py-2 w-52 bg-white border border-gray-200 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100]">
                                    <div className="max-h-[60vh] overflow-y-auto px-1">
                                        {category.category_children.map((c) => (
                                            <InteractiveLink
                                                key={c.id}
                                                href={`/categories/${c.handle}`}
                                                className="block px-4 py-3 text-[11px] uppercase tracking-wider text-gray-600 hover:bg-gray-50 hover:text-black rounded-lg"
                                            >
                                                {c.name}
                                            </InteractiveLink>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 排序按钮 */}
                        <div className="relative group">
                            <button className="flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 text-[11px] font-bold text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-all shadow-sm">
                                <span className="tracking-widest uppercase">SORT</span>
                                <svg className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            <div className="absolute top-full right-1/2 translate-x-1/2 md:translate-x-0 md:right-0 mt-2 py-2 w-48 bg-white border border-gray-200 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100]">
                                <div className="px-1">
                                    <RefinementList sortBy={sort} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}