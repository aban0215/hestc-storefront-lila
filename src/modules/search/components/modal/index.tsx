"use client"

import React, { useEffect, useState, useRef } from "react"
import { Configure, Hits, InstantSearch, SearchBox } from "react-instantsearch"
import { searchClient } from "../../../../lib/config"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useParams } from "next/navigation"
import { MagnifyingGlass } from "@medusajs/icons"

export default function SearchBarDirect({ variant = "default" }: { variant?: "default" | "icon" }) {
    const [isFocused, setIsFocused] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const pathname = usePathname()

    useEffect(() => {
        setIsFocused(false)
    }, [pathname])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsFocused(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    // --- 图标模式渲染 (PC 端 + 移动端) ---
    if (variant === "icon") {
        return (
            <div className="relative" ref={containerRef}>
                <button
                    onClick={() => setIsFocused(!isFocused)}
                    className="text-gray-700 hover:text-black w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-50 transition-all"
                    aria-label="Search"
                >
                    <MagnifyingGlass size={22} />
                </button>

                {isFocused && (
                    <>
                        {/* 遮罩层：全屏覆盖，点击关闭 */}
                        <div
                            className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-[145]"
                            onClick={() => setIsFocused(false)}
                        />

                        {/* 弹窗容器：居中定位 */}
                        <div className="fixed left-1/2 top-14 -translate-x-1/2 w-[90vw] md:w-[450px] bg-white border border-gray-100 shadow-2xl rounded-2xl z-[150] overflow-hidden">
                            <InstantSearch
                                searchClient={searchClient}
                                indexName={process.env.NEXT_PUBLIC_MEILISEARCH_INDEX_NAME || "products"}
                            >
                                <Configure hitsPerPage={6} />
                                <div className="p-4 border-b border-gray-50 flex items-center">
                                    <MagnifyingGlass size={20} className="text-black mr-3" />
                                    <SearchBox
                                        autoFocus
                                        placeholder="Search products..."
                                        className="w-full [&_input]:outline-none [&_input]:text-sm [&_button]:hidden"
                                    />
                                </div>
                                <div className="max-h-[400px] overflow-y-auto p-2 no-scrollbar">
                                    <Hits hitComponent={Hit} />
                                </div>
                            </InstantSearch>
                        </div>
                    </>
                )}
            </div>
        )
    }

    // --- 默认长条模式渲染 (已废弃，保留兼容) ---
    return (
        <div className="relative w-full" ref={containerRef}>
            <InstantSearch
                searchClient={searchClient}
                indexName={process.env.NEXT_PUBLIC_MEILISEARCH_INDEX_NAME || "products"}
            >
                <Configure hitsPerPage={8} />
                <div className={`flex items-center w-full h-11 px-4 transition-all duration-200 rounded-xl border ${isFocused ? 'bg-white border-black shadow-md' : 'bg-gray-50 border-gray-100'}`}>
                    <MagnifyingGlass size={20} className={`${isFocused ? 'text-black' : 'text-gray-400'} mr-3`} />
                    <SearchBox
                        onFocus={() => setIsFocused(true)}
                        placeholder="Search products..."
                        className="w-full [&_form]:w-full [&_input]:w-full [&_input]:bg-transparent [&_input]:text-sm [&_input]:font-light [&_input]:outline-none [&_input]:placeholder:text-gray-400 [&_button]:hidden"
                    />
                </div>
                {isFocused && (
                    <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white border border-gray-100 shadow-2xl rounded-2xl z-[150] overflow-hidden max-h-[70vh] overflow-y-auto no-scrollbar">
                        <div className="p-4 border-b border-gray-50 flex justify-between items-center">
                            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Results</span>
                            <button onClick={() => setIsFocused(false)} className="text-[10px] text-gray-500 underline lg:hidden">Close</button>
                        </div>
                        <div className="p-2"><Hits hitComponent={Hit} /></div>
                    </div>
                )}
            </InstantSearch>
        </div>
    )
}

const Hit = ({ hit, objectID }: { hit: any; objectID?: string }) => {
    const { countryCode } = useParams()

    const uniqueKey = objectID || hit.objectID || hit.id || hit.handle || `hit-${Math.random().toString(36).slice(2)}`

    return (
        <Link
            key={uniqueKey}
            href={`/${countryCode}/products/${hit.handle}`}
            className="flex flex-row gap-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors group relative"
        >
            <div className="w-14 h-16 relative flex-shrink-0 bg-[#f9f9f9] rounded-md overflow-hidden">
                <Image src={hit.thumbnail} alt={hit.title} fill className="object-cover" />
            </div>
            <div className="flex flex-col justify-center overflow-hidden">
                <h3 className="text-[13px] uppercase tracking-wider text-gray-900 font-medium truncate">{hit.title}</h3>
                <p className="text-[11px] text-gray-400 font-light line-clamp-1">{hit.description || "View details"}</p>
            </div>
        </Link>
    )
}