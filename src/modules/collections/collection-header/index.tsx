"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import RefinementList from "@modules/store/components/refinement-list"
import { HttpTypes } from "@medusajs/types"

export default function CollectionHeader({
                                             collection,
                                             collections,
                                             sort
                                         }: {
    collection: HttpTypes.StoreCollection
    collections?: HttpTypes.StoreCollection[]
    sort: string
}) {
    // 基础文字样式
    const btnClass = "flex items-center gap-x-2 py-4 text-[11px] font-medium tracking-[0.2em] text-gray-900 uppercase group hover:text-gray-500 transition-colors"

    return (
        <div className="flex items-center justify-between w-full h-full">
            {/* 左侧：COLLECTIONS 切换 */}
            {collections && collections.length > 0 && (
                <div className="relative group">
                    <button className={btnClass}>
                        <span className="truncate max-w-[120px] md:max-w-none border-b border-black/10 group-hover:border-black/40">
                            {collection.title}
                        </span>
                        <svg className="w-3 h-3 transition-transform duration-300 group-hover:rotate-180 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {/* 下拉列表：靠左弹出 */}
                    <div className="absolute top-full left-0 mt-0 py-4 w-60 bg-white shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[100] border-t border-gray-100">
                        <div className="max-h-[400px] overflow-y-auto px-4 custom-scrollbar">
                            <p className="text-[9px] text-gray-400 tracking-widest mb-4">SELECT COLLECTION</p>
                            {collections.map((c) => (
                                <LocalizedClientLink
                                    key={c.id}
                                    href={`/collections/${c.handle}`}
                                    className={`block py-2 text-[11px] uppercase tracking-wider transition-colors ${
                                        c.id === collection.id ? "text-pink-600 font-bold" : "text-gray-500 hover:text-black"
                                    }`}
                                >
                                    {c.title}
                                </LocalizedClientLink>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* 右侧：SORT 排序 */}
            <div className="relative group">
                <button className={btnClass}>
                    <span className="border-b border-black/10 group-hover:border-black/40">SORT BY</span>
                    <svg className="w-3 h-3 transition-transform duration-300 group-hover:rotate-180 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {/* 下拉列表：靠右弹出 */}
                <div className="absolute top-full right-0 mt-0 py-4 w-48 bg-white shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[100] border-t border-gray-100">
                    <div className="px-4">
                        <p className="text-[9px] text-gray-400 tracking-widest mb-2">ORDER BY</p>
                        <RefinementList sortBy={sort} />
                    </div>
                </div>
            </div>
        </div>
    )
}