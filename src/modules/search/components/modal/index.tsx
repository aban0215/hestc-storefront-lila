"use client"

import React, { useEffect, useState } from "react"
import { Hits, InstantSearch, SearchBox } from "react-instantsearch"
import { searchClient } from "../../../../lib/config"
import Modal from "../../../common/components/modal"
import { Button } from "@medusajs/ui"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search } from "@medusajs/icons" // 引入官方放大镜图标

type Hit = {
    id: string;
    title: string;
    description: string;
    handle: string;
    thumbnail: string;
    categories: {
        id: string
        name: string
        handle: string
    }[]
    tags: {
        id: string
        value: string
    }[]
}

export default function SearchModal() {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()

    useEffect(() => {
        setIsOpen(false)
    }, [pathname])

    return (
        <>
            <div className="flex items-center h-full">
                <Button
                    onClick={() => setIsOpen(true)}
                    variant="transparent"
                    className="text-gray-700 hover:text-pink-600 transition-all flex items-center justify-center p-0 min-w-[24px] hover:bg-transparent focus:!bg-transparent active:scale-95"
                >
                    {/* 使用放大镜图标，尺寸设为 20 与旁边 User 图标对齐 */}
                    <Search size={20} />
                </Button>
            </div>
            <Modal isOpen={isOpen} close={() => setIsOpen(false)}>
                <div className="p-4">
                    <InstantSearch
                        // @ts-expect-error - searchClient type issue
                        searchClient={searchClient}
                        indexName={process.env.NEXT_PUBLIC_MEILISEARCH_INDEX_NAME}
                    >
                        <SearchBox
                            autoFocus
                            placeholder="Search products..."
                            className="w-full [&_input]:w-full [&_input]:p-3 [&_input]:border [&_input]:border-gray-200 [&_input]:rounded-lg [&_input]:outline-none focus-within:[&_input]:border-pink-300 [&_form]:relative [&_button]:hidden"
                        />
                        <div className="mt-6 max-h-[60vh] overflow-y-auto">
                            <Hits hitComponent={Hit} />
                        </div>
                    </InstantSearch>
                </div>
            </Modal>
        </>
    )
}

const Hit = ({ hit }: { hit: Hit }) => {
    return (
        <div className="flex flex-row gap-x-4 py-4 border-b border-gray-50 last:border-none relative group" key={hit.id}>
            <div className="w-20 h-20 relative flex-shrink-0 bg-gray-50 rounded-md overflow-hidden">
                <Image
                    src={hit.thumbnail}
                    alt={hit.title}
                    fill
                    className="object-cover"
                />
            </div>
            <div className="flex flex-col gap-y-1">
                <h3 className="font-medium text-gray-900 group-hover:text-pink-600 transition-colors">
                    {hit.title}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2 italic">
                    {hit.description}
                </p>
            </div>
            <Link
                href={`/products/${hit.handle}`}
                className="absolute inset-0 z-10"
                aria-label={`View Product: ${hit.title}`}
            />
        </div>
    )
}