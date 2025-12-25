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
// 导入自定义类型（根据你之前的定义）
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
                className="content-container flex flex-col small:flex-row small:items-start py-6 relative"
                data-testid="product-container"
            >
                {/* 左侧：基本信息与 Tabs - 调整了 sticky 的 top 值和 padding */}
                <div className="flex flex-col small:sticky small:top-20 small:py-0 small:max-w-[300px] w-full py-8 gap-y-6">
                    <ProductInfo product={product} />
                    <ProductTabs product={product} strapiContent={strapiContent} />
                </div>

                {/* 中间：主图与 Strapi 故事内容 */}
                <div className="block w-full relative small:mx-8">
                    <ImageGallery images={images} />

                    {/* 新增：Strapi 商品故事详情 */}
                    {strapiContent && (
                        <div className="mt-12 py-12 border-t border-gray-200">
                            {strapiContent.story_title && (
                                <h2 className="text-3xl font-bold mb-6">{strapiContent.story_title}</h2>
                            )}
                            <div className="prose prose-slate max-w-none strapi-markdown">
                                <ReactMarkdown>{strapiContent.story_content}</ReactMarkdown>
                            </div>
                        </div>
                    )}
                </div>

                {/* 右侧：购买操作 - 同样调整 top 值以保持左右视觉平衡 */}
                <div className="flex flex-col small:sticky small:top-20 small:py-0 small:max-w-[300px] w-full py-8 gap-y-12">
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

            <div
                className="content-container my-16 small:my-32"
                data-testid="related-products-container"
            >
                <Suspense fallback={<SkeletonRelatedProducts />}>
                    <RelatedProducts product={product} countryCode={countryCode} />
                </Suspense>
            </div>
        </>
    )
}

export default ProductTemplate