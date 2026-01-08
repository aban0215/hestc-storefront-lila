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
            {/* 1. 移除外层所有 padding，确保图片能贴到网格边缘 */}
            <div data-testid="product-wrapper" className="flex flex-col w-full h-full overflow-hidden">

                {/* 2. 图片容器：强制直角，去掉圆角和阴影 */}
                <div className="relative w-full aspect-[3/4] bg-gray-50 overflow-hidden">
                    <Thumbnail
                        thumbnail={product.thumbnail}
                        images={product.images}
                        size="full"
                        isFeatured={isFeatured}
                        // 💡 提醒：如果 Thumbnail 内部自带了 rounded-lg，需要进去把它改成 rounded-none
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                </div>

                {/* 3. 内容区域：左对齐，增加呼吸感，但去掉左右内边距 */}
                <div className="mt-4 flex flex-col items-start text-left px-1 md:px-0">
                    {/* 标题：LV 风格首字母大写，稍微增加行高 */}
                    <Text
                        className="text-[13px] md:text-[15px] text-gray-900 font-normal leading-tight line-clamp-2"
                        data-testid="product-title"
                    >
                        {product.title}
                    </Text>

                    {/* 价格：字体颜色变浅，稍微拉开一点点间距 */}
                    <div className="mt-1.5 text-[13px] md:text-[14px] text-gray-500 font-light tracking-tight">
                        {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
                    </div>
                </div>
            </div>
        </LocalizedClientLink>
    )
}