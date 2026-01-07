import { Text } from "@medusajs/ui"
import { listProducts } from "@lib/data/products"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"

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
            <div data-testid="product-wrapper" className="flex flex-col">
                {/* 图片容器：保持比例，去掉多余边距 */}
                <Thumbnail
                    thumbnail={product.thumbnail}
                    images={product.images}
                    size="full"
                    isFeatured={isFeatured}
                />

                {/* 内容区域：改为左对齐 (items-start text-left) */}
                <div className="mt-3 flex flex-col items-start text-left">
                    {/* 标题：去掉 uppercase，改用标准粗细，紧凑行高 */}
                    <Text
                        className="text-[14px] md:text-[16px] text-gray-900 font-normal leading-snug line-clamp-2"
                        data-testid="product-title"
                    >
                        {product.title}
                    </Text>

                    {/* 价格：字体颜色变浅 (text-gray-500)，稍微变细 */}
                    <div className="mt-1 text-[14px] md:text-[15px] text-gray-500 font-light tracking-tight">
                        {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
                    </div>
                </div>
            </div>
        </LocalizedClientLink>
    )
}