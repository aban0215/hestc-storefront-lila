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
        <>
            <div
                className="content-container flex flex-col small:flex-row small:items-start py-6 relative gap-x-12"
                data-testid="product-container"
            >
                {/* 左侧：商品核心信息 - 降低置顶偏移量，取消移动端冗余 padding */}
                <div className="flex flex-col small:sticky small:top-24 small:py-0 small:max-w-[280px] w-full py-4 gap-y-8">
                    <div className="pb-4 border-b border-gray-100">
                        <ProductInfo product={product} />
                    </div>
                    <ProductTabs product={product} strapiContent={strapiContent} />
                </div>

                {/* 中间：主展示区 */}
                <div className="block w-full relative flex-1">
                    {/* 商品图集 */}
                    <div className="rounded-xl overflow-hidden shadow-sm">
                        <ImageGallery images={images} />
                    </div>

                    {/* Strapi 品牌故事区 - 优化排版 */}
                    {strapiContent && (
                        <div className="mt-16 pt-16 border-t border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                            {strapiContent.story_title && (
                                <div className="mb-10 text-center">
                                    <h2 className="text-2xl md:text-4xl font-serif font-bold text-gray-900 inline-block relative tracking-tight">
                                        {strapiContent.story_title}
                                        <span className="absolute -bottom-2 left-1/4 right-1/4 h-1 bg-gradient-to-r from-transparent via-gray-400 to-transparent opacity-50"></span>
                                    </h2>
                                </div>
                            )}

                            <div className="prose prose-slate max-w-none
                prose-headings:font-serif prose-headings:font-semibold
                prose-p:text-gray-600 prose-p:leading-relaxed prose-p:text-lg
                prose-img:rounded-2xl prose-img:shadow-lg prose-img:mx-auto prose-img:my-12
                strapi-markdown"
                            >
                                <ReactMarkdown
                                    components={{
                                        // 优化渲染后的图片样式
                                        img: ({ node, ...props }) => (
                                            <img
                                                {...props}
                                                className="w-full max-w-4xl hover:scale-[1.01] transition-transform duration-500"
                                                loading="lazy"
                                            />
                                        ),
                                    }}
                                >
                                    {strapiContent.story_content}
                                </ReactMarkdown>
                            </div>
                        </div>
                    )}
                </div>

                {/* 右侧：购买决策区 - 保持与左侧视觉高度一致 */}
                <div className="flex flex-col small:sticky small:top-24 small:py-0 small:max-w-[320px] w-full py-8 gap-y-12">
                    <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm">
                        <ProductOnboardingCta />
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

                </div>
            </div>

            {/* 相关商品推荐 - 增加背景区分度 */}
            <div className="bg-gray-50 w-full mt-20 py-20">
                <div
                    className="content-container"
                    data-testid="related-products-container"
                >
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-bold">You might also like</h3>
                    </div>
                    <Suspense fallback={<SkeletonRelatedProducts />}>
                        <RelatedProducts product={product} countryCode={countryCode} />
                    </Suspense>
                </div>
            </div>
        </>
    )
}

export default ProductTemplate