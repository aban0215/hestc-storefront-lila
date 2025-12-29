"use client" // 只有这个小组件需要客户端交互

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
    return (
        <div className="w-full border-b border-gray-100 bg-white relative z-50">
            <div className="max-w-[1440px] mx-auto px-4 py-6 md:py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">

                {/* 标题区 */}
                <div className="text-center md:text-left">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 uppercase">
                        {collection.title}
                    </h1>
                </div>

                {/* 交互区 */}
                <div className="flex items-center justify-center md:justify-end gap-2 md:gap-4">
                    {/* COLLECTIONS 下拉 */}
                    {collections && collections.length > 0 && (
                        <div className="relative group">
                            <button className="flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 text-[11px] font-bold text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-all shadow-sm min-w-[140px] md:min-w-[160px] justify-between">
                                <span className="tracking-widest uppercase truncate">{collection.title}</span>
                                <svg className="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-180 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            <div className="absolute top-full right-1/2 translate-x-1/2 md:translate-x-0 md:right-0 mt-2 py-2 w-52 md:w-56 bg-white border border-gray-200 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100]">
                                <div className="absolute -top-2 left-0 right-0 h-2 bg-transparent" />
                                <div className="max-h-[60vh] md:max-h-[300px] overflow-y-auto px-1 custom-scrollbar">
                                    {collections.map((c) => (
                                        <LocalizedClientLink
                                            key={c.id}
                                            href={`/collections/${c.handle}`}
                                            className={`block px-4 py-3 text-[10px] md:text-[11px] uppercase tracking-wider rounded-lg transition-colors ${
                                                c.id === collection.id ? "bg-gray-100 text-pink-600 font-bold" : "text-gray-500 hover:bg-gray-50 hover:text-black"
                                            }`}
                                        >
                                            {c.title}
                                        </LocalizedClientLink>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SORT 下拉 */}
                    <div className="relative group">
                        <button className="flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 text-[11px] font-bold text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-all shadow-sm">
                            <span className="tracking-widest uppercase">SORT</span>
                            <svg className="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-180 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        <div className="absolute top-full right-1/2 translate-x-1/2 md:translate-x-0 md:right-0 mt-2 py-2 w-44 md:w-48 bg-white border border-gray-200 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100]">
                            <div className="absolute -top-2 left-0 right-0 h-2 bg-transparent" />
                            <div className="px-1">
                                <RefinementList sortBy={sort} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}