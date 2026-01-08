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
    // 基础文字样式：去掉了圆角和背景，改为纯文字+下划线逻辑
    const btnClass = "flex items-center gap-x-2 py-2 text-[11px] font-medium tracking-[0.2em] text-gray-900 uppercase group hover:text-gray-500 transition-colors"

    return (
        <div className="flex items-center justify-between w-full h-full min-h-[56px]">
            {/* 左侧：COLLECTIONS 切换 */}
            {collections && collections.length > 0 && (
                <div className="relative group flex items-center">
                    <button className={btnClass}>
            <span className="relative pb-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-black after:scale-x-100 group-hover:after:scale-x-0 after:transition-transform after:duration-300">
              {collection.title}
            </span>
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {/* 下拉列表：靠左弹出 */}
                    <div className="absolute top-full left-0 mt-0 py-5 w-64 bg-white shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[100] border-t border-gray-100">
                        <div className="max-h-[400px] overflow-y-auto px-6 custom-scrollbar">
                            <p className="text-[9px] text-gray-400 tracking-widest mb-4">SELECT COLLECTION</p>
                            <div className="flex flex-col gap-y-3">
                                {collections.map((c) => (
                                    <LocalizedClientLink
                                        key={c.id}
                                        href={`/collections/${c.handle}`}
                                        className={`block text-[11px] uppercase tracking-widest transition-colors ${
                                            c.id === collection.id ? "text-black font-bold" : "text-gray-400 hover:text-black"
                                        }`}
                                    >
                                        {c.title}
                                    </LocalizedClientLink>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 中间弹簧：强制把左右推开 */}
            {/*<div className="flex-1"></div>*/}

            {/* 右侧：SORT 排序 */}
          {/*  <div className="relative group flex items-center">*/}
          {/*      <button className={btnClass}>*/}
          {/*<span className="relative pb-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-black/10 group-hover:after:bg-black after:transition-colors">*/}
          {/*  SORT BY*/}
          {/*</span>*/}
          {/*          <svg className="w-3 h-3 transition-transform duration-300 group-hover:rotate-180 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">*/}
          {/*              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M19 9l-7 7-7-7" />*/}
          {/*          </svg>*/}
          {/*      </button>*/}

          {/*      /!* 下拉列表：靠右弹出 *!/*/}
          {/*      <div className="absolute top-full right-0 mt-0 py-5 w-48 bg-white shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[100] border-t border-gray-100">*/}
          {/*          <div className="px-6">*/}
          {/*              <p className="text-[9px] text-gray-400 tracking-widest mb-3">ORDER BY</p>*/}
          {/*              <RefinementList sortBy={sort} />*/}
          {/*          </div>*/}
          {/*      </div>*/}
          {/*  </div>*/}
        </div>
    )
}