import { Text } from "@medusajs/ui"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"
import BackButton from "@modules/account/components/back-button";

export default async function ProductPreview({
                                                 product,
                                                 isFeatured,
                                                 region,
                                             }: {
    product: HttpTypes.StoreProduct
    isFeatured?: boolean
    region: HttpTypes.StoreRegion
}) {
    const { cheapestPrice } = getProductPrice({ product })

    return (
        <LocalizedClientLink href={`/products/${product.handle}`} className="group">
            <div data-testid="product-wrapper" className="flex flex-col w-full h-full">
                <div className="content-container pt-20 md:pt-24 pb-2">
                    <BackButton />
                </div>
                {/* 1. 图片容器：完全直角，极简背景 */}
                <div className="relative w-full aspect-[4/5] bg-[#f5f5f5] overflow-hidden">
                    <Thumbnail
                        thumbnail={product.thumbnail}
                        images={product.images}
                        size="full"
                        isFeatured={isFeatured}
                        // 动画持续时间拉长，让缩放感更顺滑、更高贵
                        className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                    />
                </div>

                {/* 2. 信息区域：极致的文字排版 */}
                <div className="mt-5 flex flex-col items-center text-center px-2">
                    {/* 💡 这里我改成了居中 items-center，LV 的列表通常是居中排版，你可以对比一下 */}

                    {/* 商品标题：微调字间距，保持高冷 */}
                    <Text
                        className="text-[13px] md:text-[14px] text-gray-900 font-light tracking-wide leading-relaxed line-clamp-2 uppercase"
                        data-testid="product-title"
                    >
                        {product.title}
                    </Text>

                    {/* 价格：更淡、更细 */}
                    <div className="mt-2 text-[12px] md:text-[13px] text-gray-400 font-light tracking-widest">
                        {cheapestPrice ? (
                            <PreviewPrice price={cheapestPrice} />
                        ) : (
                            <span className="opacity-0">000.00</span> // 占位保持高度一致
                        )}
                    </div>
                </div>
            </div>
        </LocalizedClientLink>
    )
}