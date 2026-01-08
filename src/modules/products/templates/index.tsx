import React, { Suspense } from "react"
import ProductActions from "@modules/products/components/product-actions"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import ProductActionsWrapper from "./product-actions-wrapper"
import { LilaProductContent } from "../../../lib/strapi/product-content"
import ReactMarkdown from "react-markdown"
import SizeGuideModal from "@modules/products/components/size-guide-modal"
import Image from "next/image" // 建议使用 Next.js Image 优化性能

type ProductTemplateProps = {
    product: HttpTypes.StoreProduct
    region: HttpTypes.StoreRegion
    countryCode: string
    images: HttpTypes.StoreProductImage[]
    strapiContent?: LilaProductContent | null
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
                                                             product,
                                                             region,
                                                             countryCode,
                                                             images,
                                                             strapiContent,
                                                         }) => {
    if (!product || !product.id) {
        return notFound()
    }

    return (
        <div className="relative overflow-x-hidden w-full bg-white">
            {/* 【第一部分：核心购买区】 */}
            {/* 关键：去掉 items-start，让容器自然拉伸高度 */}
            <div className="content-container flex flex-col small:flex-row py-0 small:py-12 relative gap-x-12 lg:gap-x-24">

                {/* A. 左侧：图片瀑布流 - LV 风格核心 */}
                <div className="flex flex-col w-full flex-1 gap-y-2 small:gap-y-4">
                    {images && images.length > 0 ? (
                        images.map((image, index) => (
                            <div
                                key={image.id || index}
                                className="relative w-full aspect-[4/5] bg-gray-50 overflow-hidden"
                            >
                                <img
                                    src={image.url}
                                    alt={`${product.title} - view ${index + 1}`}
                                    className="w-full h-full object-cover object-center"
                                    loading={index === 0 ? "eager" : "lazy"}
                                />
                            </div>
                        ))
                    ) : (
                        <div className="w-full aspect-[4/5] bg-gray-100 flex items-center justify-center">
                            No Image Available
                        </div>
                    )}
                </div>

                {/* B. 右侧：信息锁定区 */}
                {/* 关键：sticky 定位，top 值取决于你的 Header 高度 */}
                <div className="small:w-[400px] lg:w-[440px] w-full px-4 small:px-0">
                    <div className="flex flex-col small:sticky small:top-28 py-12 small:py-0 gap-y-12">

                        {/* 1. 商品基础信息 (建议 ProductInfo 内调大字间距) */}
                        <div className="pb-10 border-b border-gray-100">
                            <ProductInfo product={product} />
                        </div>

                        {/* 2. 购买操作区域 */}
                        <div className="flex flex-col gap-y-8">
                            {/* Size Guide - LV 风格通常放在规格选择上方 */}
                            {strapiContent?.size_guide && (
                                <div className="flex justify-end">
                                    <SizeGuideModal sizeGuide={strapiContent.size_guide} />
                                </div>
                            )}

                            <Suspense
                                fallback={
                                    <ProductActions
                                        disabled={true}
                                        product={product}
                                        region={region}
                                    />
                                }
                            >
                                <ProductActionsWrapper id={product.id} region={region} />
                            </Suspense>
                        </div>

                        {/* 3. 详细信息面板 */}
                        <div className="pt-6">
                            <ProductTabs product={product} strapiContent={strapiContent} />
                        </div>
                    </div>
                </div>
            </div>

            {/* 【第二部分：Strapi 品牌叙事区】 */}
            {strapiContent?.story_content && (
                <div className="w-full mt-24 small:mt-48 border-t border-gray-100 bg-white">
                    <div className="max-w-3xl mx-auto py-24 small:py-40 px-6">
                        {/* 极简标题设计 */}
                        <div className="flex flex-col items-center mb-24 text-center">
                            <h2 className="text-3xl md:text-5xl font-light text-gray-900 tracking-[0.15em] uppercase mb-10">
                                {strapiContent.story_title}
                            </h2>
                            <div className="w-12 h-[1px] bg-black"></div>
                        </div>

                        {/* 品牌叙事富文本 */}
                        <div className="prose prose-neutral max-w-none
                            prose-p:text-gray-700 prose-p:leading-[2.2] prose-p:font-light prose-p:mb-16 prose-p:text-lg
                            prose-headings:font-normal prose-headings:tracking-widest
                            strapi-markdown"
                        >
                            <ReactMarkdown
                                components={{
                                    p: "div",
                                    img: ({ node, ...props }) => (
                                        <div className="my-32 -mx-4 md:-mx-32 relative">
                                            <img
                                                {...props}
                                                className="w-full object-cover shadow-none rounded-none"
                                                loading="lazy"
                                            />
                                        </div>
                                    ),
                                }}
                            >
                                {strapiContent.story_content}
                            </ReactMarkdown>
                        </div>
                    </div>
                </div>
            )}

            {/* 【第三部分：相关推荐】 */}
            <div className="bg-[#f9f9f9] w-full py-24 small:py-40 border-t border-gray-100">
                <div className="content-container">
                    <div className="mb-16">
                        <h3 className="text-2xl font-light tracking-widest uppercase text-center">You May Also Like</h3>
                    </div>
                    <Suspense fallback={<SkeletonRelatedProducts />}>
                        <RelatedProducts product={product} countryCode={countryCode} />
                    </Suspense>
                </div>
            </div>
        </div>
    )
}

export default ProductTemplate