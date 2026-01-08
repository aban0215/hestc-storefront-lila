"use client"

import React, { useEffect, useState, useRef } from "react"
import { Configure, Hits, InstantSearch, SearchBox } from "react-instantsearch"
import { searchClient } from "../../../../lib/config"
import Modal from "../../../common/components/modal"
import { Button } from "@medusajs/ui"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useParams } from "next/navigation"
import { MagnifyingGlass } from "@medusajs/icons"
import { useInstantSearch } from "react-instantsearch"


export default function SearchModal() {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()
    // 增加一个 ref 专门给输入框定位
    const searchInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        setIsOpen(false)
    }, [pathname])

    // 💡 关键：移动端需要一个显式的点击来处理 focus
    const handleOpen = () => {
        setIsOpen(true)
        // 给一点点延迟，确保 Modal 动画开始后再尝试 focus
        setTimeout(() => {
            const input = document.querySelector('.ais-SearchBox-input') as HTMLInputElement
            if (input) input.focus()
        }, 150)
    }

    return (
        <>
            <div className="flex items-center h-full">
                <Button
                    onClick={handleOpen} // 使用处理过的打开函数
                    variant="transparent"
                    className="text-gray-700 hover:text-black transition-all flex items-center justify-center p-0 min-w-[24px] hover:bg-transparent focus:!bg-transparent active:scale-95"
                >
                    <MagnifyingGlass size={20} />
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold hidden lg:block ml-1">
                        Search
                    </span>
                </Button>
            </div>

            <Modal isOpen={isOpen} close={() => setIsOpen(false)}>
                {/* 增加背景色和边距适配 */}
                <div className="p-4 md:p-8 bg-white min-h-[50vh]">
                    <InstantSearch
                        // @ts-expect-error - searchClient type issue
                        searchClient={searchClient}
                        indexName={process.env.NEXT_PUBLIC_MEILISEARCH_INDEX_NAME}
                    >


                        <Configure hitsPerPage={10} />

                        {/* --- LV 风格搜索框：去掉圆角，改用底边线 --- */}
                        <div className="relative border-b border-gray-200 pb-2">
                            <SearchBox
                                placeholder="SEARCH OUR COLLECTIONS..."
                                className="w-full
                                    [&_input]:w-full
                                    [&_input]:bg-transparent
                                    [&_input]:text-lg
                                    [&_input]:font-light
                                    [&_input]:tracking-widest
                                    [&_input]:uppercase
                                    [&_input]:outline-none
                                    [&_input]:placeholder:text-gray-300
                                    [&_form]:relative
                                    [&_button]:hidden"
                            />
                        </div>

                        <div className="mt-8 max-h-[60vh] overflow-y-auto no-scrollbar">
                            <Hits hitComponent={Hit} />
                        </div>
                    </InstantSearch>
                </div>
            </Modal>
        </>
    )
}

const Hit = ({ hit }: { hit: any }) => {
    const { countryCode } = useParams()
    return (
        <div className="flex flex-row gap-x-6 py-6 border-b border-gray-50 relative group">
            {/* 图片去掉圆角，改用背景浅灰 */}
            <div className="w-16 h-20 relative flex-shrink-0 bg-[#f9f9f9]">
                <Image
                    src={hit.thumbnail}
                    alt={hit.title}
                    fill
                    className="object-cover"
                />
            </div>
            <div className="flex flex-col justify-center gap-y-1">
                <h3 className="text-[13px] uppercase tracking-wider text-gray-900 font-medium">
                    {hit.title}
                </h3>
                <p className="text-[11px] text-gray-400 font-light line-clamp-1">
                    {hit.description || "View details"}
                </p>
            </div>
            <Link
                href={`/${countryCode}/products/${hit.handle}`}
                className="absolute inset-0 z-10"
            />
        </div>
    )
}