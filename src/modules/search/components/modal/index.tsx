"use client"

import React, { useEffect, useState, useRef } from "react"
import { Configure, Hits, InstantSearch, SearchBox } from "react-instantsearch"
import { searchClient } from "../../../../lib/config"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useParams } from "next/navigation"
import { MagnifyingGlass } from "@medusajs/icons"

export default function SearchBarDirect() {
    const [isFocused, setIsFocused] = useState(false)
    const [searchValue, setSearchValue] = useState("")
    const containerRef = useRef<HTMLDivElement>(null)
    const pathname = usePathname()

    // 路由改变（点结果跳转）后自动关闭结果列表并清空
    useEffect(() => {
        setIsFocused(false)
    }, [pathname])

    // 点击外部区域关闭列表
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsFocused(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    return (
        <div className="relative w-full" ref={containerRef}>
            <InstantSearch
                searchClient={searchClient}
                indexName={process.env.NEXT_PUBLIC_MEILISEARCH_INDEX_NAME || "products"}
            >
                <Configure hitsPerPage={8} />

                {/* --- 搜索输入框容器 --- */}
                <div
                    className={`flex items-center w-full h-11 px-4 transition-all duration-200 rounded-xl border 
                    ${isFocused ? 'bg-white border-black shadow-md' : 'bg-gray-50 border-gray-100'}`}
                >
                    <MagnifyingGlass size={20} className={`${isFocused ? 'text-black' : 'text-gray-400'} mr-3`} />
                    <SearchBox
                        onFocus={() => setIsFocused(true)}
                        placeholder="Search products..."
                        className="w-full
                            [&_form]:w-full
                            [&_input]:w-full
                            [&_input]:bg-transparent
                            [&_input]:text-sm
                            [&_input]:font-light
                            [&_input]:outline-none
                            [&_input]:placeholder:text-gray-400
                            [&_button]:hidden"
                    />
                </div>

                {/* --- 搜索结果下拉层 --- */}
                {isFocused && (
                    <div className="
                        absolute top-[calc(100%+8px)] left-0 right-0
                        bg-white border border-gray-100 shadow-2xl rounded-2xl
                        z-[150] overflow-hidden
                        /* 移动端适配：如果是在手机上，可以限制高度并允许滚动 */
                        max-h-[70vh] md:max-h-[500px] overflow-y-auto no-scrollbar
                    ">
                        {/* 搜索提示状态 */}
                        <div className="p-4 border-b border-gray-50 flex justify-between items-center">
                            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                                Results
                            </span>
                            <button
                                onClick={() => setIsFocused(false)}
                                className="text-[10px] text-gray-500 underline lg:hidden"
                            >
                                Close
                            </button>
                        </div>

                        {/* 结果列表 */}
                        <div className="p-2">
                            <Hits hitComponent={Hit} />
                        </div>

                        {/* 底部空状态引导 */}
                        <div className="p-4 bg-gray-50 text-center">
                            <p className="text-[11px] text-gray-400 italic">
                                Suggestions are based on your current collection
                            </p>
                        </div>
                    </div>
                )}
            </InstantSearch>
        </div>
    )
}

const Hit = ({ hit }: { hit: any }) => {
    const { countryCode } = useParams()

    return (
        <Link
            href={`/${countryCode}/products/${hit.handle}`}
            className="flex flex-row gap-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors group relative"
        >
            <div className="w-14 h-16 relative flex-shrink-0 bg-[#f9f9f9] rounded-md overflow-hidden">
                <Image
                    src={hit.thumbnail}
                    alt={hit.title}
                    fill
                    className="object-cover"
                />
            </div>
            <div className="flex flex-col justify-center overflow-hidden">
                <h3 className="text-[13px] uppercase tracking-wider text-gray-900 font-medium truncate">
                    {hit.title}
                </h3>
                <p className="text-[11px] text-gray-400 font-light line-clamp-1">
                    {hit.description || "View details"}
                </p>
            </div>
        </Link>
    )
}