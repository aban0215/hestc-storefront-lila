"use client"

import { HttpTypes } from "@medusajs/types"
import Accordion from "./accordion"
import { LilaProductContent } from "../../../../lib/strapi/product-content"
import Image from "next/image"
import { XMark } from "@medusajs/icons"
import { useState, useEffect } from "react"
import { createPortal } from "react-dom"

type ProductTabsProps = {
    product: HttpTypes.StoreProduct
    strapiContent?: LilaProductContent | null
}

const ProductTabs = ({ product, strapiContent }: ProductTabsProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = "unset"
        }
    }, [isModalOpen])

    const tabs = []

    if (strapiContent?.size_guide) {
        tabs.push({
            label: "Size Guide",
            component: (
                <div className="flex flex-col py-4">
                    <div
                        className="relative w-full aspect-[1245/805] cursor-zoom-in hover:opacity-90 transition-opacity"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <Image
                            src={strapiContent.size_guide.url}
                            alt="Size Guide"
                            fill
                            className="object-contain"
                        />
                    </div>

                    {isModalOpen && mounted &&
                    createPortal(
                        <div
                            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 p-4 md:p-10 cursor-zoom-out"
                            onClick={() => setIsModalOpen(false)}
                        >
                            <button
                                className="absolute top-6 right-6 text-white hover:text-ui-fg-subtle transition-colors z-[100000]"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setIsModalOpen(false)
                                }}
                            >
                                <XMark size={32} />
                            </button>
                            <div className="relative w-full h-full max-w-5xl max-h-[90vh]">
                                <Image
                                    src={strapiContent.size_guide.url}
                                    alt="Size Guide Full"
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </div>
                        </div>,
                        document.body
                    )}
                </div>
            ),
        })
    }

    if (strapiContent?.lilafaqitem && strapiContent.lilafaqitem.length > 0) {
        tabs.push({
            label: "FAQ",
            component: (
                <div className="flex flex-col py-4 gap-y-6">
                    {strapiContent.lilafaqitem.map((item) => (
                        <div key={item.id} className="text-small-regular">
                            <p className="font-bold mb-1 text-black">{item.question}</p>
                            <p className="text-ui-fg-subtle leading-relaxed">{item.answer}</p>
                        </div>
                    ))}
                </div>
            ),
        })
    }

    if (strapiContent?.care_instructions) {
        tabs.push({
            label: "Care Instructions",
            component: (
                <div className="text-small-regular text-ui-fg-subtle py-4 leading-relaxed max-w-full break-words whitespace-pre-line">
                    <p>{strapiContent.care_instructions}</p>
                </div>
            ),
        })
    }

    return (
        <div className="w-full">
            <div className="text-small-regular py-8">
                {/* --- 新增的描述区域 --- */}
                <div className="mb-8">
                    <span className="font-semibold text-2xl block mb-2 text-ui-fg-base">Details & Description</span>
                    <p className="text-ui-fg-subtle text-xl leading-relaxed whitespace-pre-line">
                        {product.description ? product.description : "-"}
                    </p>
                </div>
                {/* --------------------- */}

                <div className="grid grid-cols-2 gap-x-8">
                    <div className="flex flex-col gap-y-4">
                        <div>
                            <span className="font-semibold text-2xl">Material</span>
                            <p className="text-xl">{product.material ? product.material : "-"}</p>
                        </div>
                        <div className="flex items-baseline gap-x-2">
                            <span className="font-semibold text-2xl">Country of origin:</span>
                            <p className="text-xl">{product.origin_country ? product.origin_country : "-"}</p>
                        </div>
                        <div>
                            <span className="font-semibold text-2xl">Type</span>
                            <p className="text-xl">{product.type ? product.type.value : "-"}</p>
                        </div>
                        <div>
                            <span className="font-semibold text-2xl">Weight</span>
                            <p className="text-xl">{product.weight ? `${product.weight} g` : "-"}</p>
                        </div>
                    </div>
                </div>
            </div>
            <Accordion type="multiple">
                {tabs.map((tab, i) => (
                    <Accordion.Item key={i} title={tab.label} value={tab.label}>
                        {tab.component}
                    </Accordion.Item>
                ))}
            </Accordion>
        </div>
    )
}

export default ProductTabs