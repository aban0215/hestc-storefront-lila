import React, { Suspense } from "react"
import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductOnboardingCta from "@modules/products/components/product-onboarding-cta"
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
        <div className="relative overflow-x-hidden w-full">
            {/* 【第一部分：核心购买区】 左右结构 */}
            <div className="content-container flex flex-col small:flex-row small:items-start py-8 relative gap-x-16">

                {/* A. 左侧：Medusa 商品图集 (占据 60% 左右宽度) */}
                <div className="block w-full relative flex-1">
                    <div className="rounded-2xl overflow-hidden shadow-sm">
                        <ImageGallery images={images} />
                    </div>
                </div>

                {/* B. 右侧：混合信息流 (Sticky 固态挂起) */}
                <div className="flex flex-col small:sticky small:top-24 small:max-w-[380px] w-full py-2 gap-y-10">

                    {/* 1. Medusa 标题 & 价格 + Strapi Slogan */}
                    <div className="pb-8 border-b border-gray-100">
                        <ProductInfo product={product} />
                    </div>

                    {/* 2. 购买操作区域 (Medusa 规格 + Strapi SizeGuide) */}
                    <div className="flex flex-col gap-y-6">
                        {/* Size Guide 弹出按钮 */}
                        {strapiContent?.size_guide && (
                            <div className="flex justify-end -mb-4">
                                <SizeGuideModal sizeGuide={strapiContent.size_guide} />
                            </div>
                        )}

                        {/*<ProductOnboardingCta />*/}

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

                    {/* 3. 混合信息面板 (Medusa Description + Strapi FAQ/Care) */}
                    <div className="pt-4">
                        <ProductTabs product={product} strapiContent={strapiContent} />
                    </div>
                </div>
            </div>

            {/* 【第二部分：Strapi 品牌叙事区】 位于下方，全宽沉浸式 */}
            {strapiContent?.story_content && (
                // <div className="w-full mt-32 border-t border-gray-100 bg-white overflow-hidden">
                <div className="w-full mt-32 border-t border-gray-100 bg-white overflow-x-hidden">
                    <div className="max-w-4xl mx-auto py-24 px-6">
                        {/* 装饰性标题 */}
                        <div className="flex flex-col items-center mb-20 text-center">
                            {/*<span className="text-[10px] tracking-[0.5em] uppercase text-gray-400 mb-4 font-bold">Behind The Piece</span>*/}
                            <h2 className="text-4xl md:text-5xl font-serif text-gray-900 tracking-tight italic">
                                {strapiContent.story_title}
                            </h2>
                            <div className="mt-8 w-20 h-[1px] bg-pink-100"></div>
                        </div>

                        {/* 富文本内容：通过 ReactMarkdown 渲染 Strapi 的故事和图片 */}
                        <div className="prose prose-slate prose-xl max-w-none
                            prose-p:text-gray-600 prose-p:leading-[2.2] prose-p:font-light prose-p:mb-12
                            prose-headings:font-serif prose-headings:text-gray-900
                            strapi-markdown"
                        >
                            <ReactMarkdown
                                components={{
                                    p: "div", // 核心：解决 <div> 不能嵌套在 <p> 里的 Hydration 错误
                                    img: ({ node, ...props }) => (
                                        <div className="my-24 -mx-4 md:-mx-20 relative group">
                                            <img
                                                {...props}
                                                className="w-full rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.1)] hover:scale-[1.02] transition-transform duration-[1.2s] ease-out"
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
            <div className="bg-gray-50 w-full py-32 border-t border-gray-100">
                <div className="content-container">
                    <Suspense fallback={<SkeletonRelatedProducts />}>
                        <RelatedProducts product={product} countryCode={countryCode} />
                    </Suspense>
                </div>
            </div>
        </div>
    )
}

export default ProductTemplate