import { Text } from "@medusajs/ui"
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
            <div data-testid="product-wrapper" className="flex flex-col w-full h-full">
                {/* 1. 图片容器 */}
                <div className="relative w-full aspect-[4/5] bg-[#f5f5f5] overflow-hidden">
                    <Thumbnail
                        thumbnail={product.thumbnail}
                        images={product.images}
                        size="full"
                        isFeatured={isFeatured}
                        className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                    />
                </div>

                {/* 2. 信息区域 */}
                <div className="mt-4 flex flex-col items-center text-center px-2">

                    {/* 商品标题：
                        - line-clamp-2: 强制两行，多余冒泡(...)
                        - leading-normal: 舒适的行间距
                        - break-words: 确保长单词正常换行
                    */}
                    <h3
                        className="text-[13px] md:text-[14px] text-gray-900 font-semibold uppercase tracking-wide leading-normal line-clamp-2 break-words"
                        data-testid="product-title"
                    >
                        {product.title}
                    </h3>

                    {/* 价格区域：
                        - mt-2: 与标题保持固定间距，不会重叠
                        - font-normal: 价格不加粗
                    */}
                    <div className="mt-2 text-[13px] md:text-[15px] text-gray-900 font-normal tracking-tight">
                        {cheapestPrice ? (
                            <div className="flex items-center justify-center gap-x-1">
                                <PreviewPrice price={cheapestPrice} />
                                <span className="ml-1 uppercase text-[10px] md:text-[11px] opacity-70">
                                    {region?.currency_code}
                                </span>
                            </div>
                        ) : (
                            <span className="opacity-0">0.00</span>
                        )}
                    </div>
                </div>
            </div>
        </LocalizedClientLink>
    )
}