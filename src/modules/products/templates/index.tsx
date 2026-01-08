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
        // 核心：外层不能设 overflow-hidden，否则 sticky 失效
        <div className="relative w-full bg-white">

            {/* 【第一部分：核心购买区】 */}
            {/* 关键：items-start 必须保留，确保右侧不会被拉伸成跟左侧一样高，这样 sticky 才有滑动空间 */}
            <div className="content-container flex flex-col small:flex-row items-start py-8 small:py-16 relative gap-x-12 lg:gap-x-24">

                {/* A. 左侧：图片瀑布流 (决定了整个区域的总高度) */}
                <div className="flex flex-col w-full flex-1 gap-y-4">
                    {images?.map((image, index) => (
                        <div key={image.id || index} className="w-full bg-gray-50">
                            <img
                                src={image.url}
                                alt={`${product.title} - ${index}`}
                                className="w-full h-auto object-cover"
                                loading={index === 0 ? "eager" : "lazy"}
                            />
                        </div>
                    ))}
                </div>

                {/* B. 右侧：信息锁定区 */}
                {/* h-full 确保它在父级容器内，sticky 配合 top 定位 */}
                <aside className="w-full small:w-[400px] lg:w-[450px] small:sticky small:top-24 self-start">
                    <div className="flex flex-col gap-y-12 py-8 small:py-0">

                        {/* 1. 标题价格 */}
                        <div className="pb-10 border-b border-gray-100">
                            <ProductInfo product={product} />
                        </div>

                        {/* 2. 购买操作 */}
                        <div className="flex flex-col gap-y-8">
                            {strapiContent?.size_guide && (
                                <div className="flex justify-end -mb-4">
                                    <SizeGuideModal sizeGuide={strapiContent.size_guide} />
                                </div>
                            )}

                            <Suspense
                                fallback={<ProductActions disabled={true} product={product} region={region} />}
                            >
                                <ProductActionsWrapper id={product.id} region={region} />
                            </Suspense>
                        </div>

                        {/* 3. 详情 Tab */}
                        <div className="pt-4">
                            <ProductTabs product={product} strapiContent={strapiContent} />
                        </div>
                    </div>
                </aside>
            </div>

            {/* 【第二部分：品牌叙事区】 */}
            {strapiContent?.story_content && (
                <section className="w-full mt-32 border-t border-gray-100 bg-white">
                    <div className="max-w-3xl mx-auto py-32 px-6">
                        <div className="flex flex-col items-center mb-20 text-center">
                            <h2 className="text-4xl font-light tracking-[0.2em] uppercase text-gray-900">
                                {strapiContent.story_title}
                            </h2>
                            <div className="mt-8 w-12 h-[1px] bg-black"></div>
                        </div>

                        <div className="prose prose-neutral max-w-none prose-p:leading-[2] prose-p:font-light">
                            <ReactMarkdown
                                components={{
                                    p: "div",
                                    img: ({ node, ...props }) => (
                                        <div className="my-24 -mx-4 md:-mx-24">
                                            <img {...props} className="w-full" />
                                        </div>
                                    ),
                                }}
                            >
                                {strapiContent.story_content}
                            </ReactMarkdown>
                        </div>
                    </div>
                </section>
            )}

            {/* 【第三部分：相关推荐】 */}
            <footer className="bg-gray-50 w-full py-32 border-t border-gray-100">
                <div className="content-container">
                    <Suspense fallback={<SkeletonRelatedProducts />}>
                        <RelatedProducts product={product} countryCode={countryCode} />
                    </Suspense>
                </div>
            </footer>
        </div>
    )
}

export default ProductTemplate