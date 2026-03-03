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
                {/* 1. 图片容器：完全直角 */}
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
                <div className="mt-5 flex flex-col items-center text-center px-2 flex-grow">

                    {/* 商品标题：支持换行 (line-clamp-2)，字重改为 semibold 以区分 */}
                    <h3
                        className="text-[13px] md:text-[14px] text-gray-900 font-semibold tracking-wide leading-snug uppercase line-clamp-2 min-h-[2.5rem]"
                        data-testid="product-title"
                    >
                        {product.title}
                    </h3>

                    {/* 价格：深黑色 (gray-900)，正常字重 (font-normal)，字号放大 */}
                    <div className="mt-3 text-[13px] md:text-[15px] text-gray-900 font-normal tracking-tight">
                        {cheapestPrice ? (
                            /* 注意：PreviewPrice 内部通常会渲染类似 $100.00 的格式。
                               通过在外层定义 text-gray-900 和 font-normal，
                               可以强制覆盖其可能继承的浅色样式。
                            */
                            <div className="flex items-center gap-x-1">
                                <PreviewPrice price={cheapestPrice} />
                                <span className="ml-1 uppercase text-[11px] md:text-[12px]">{region?.currency_code}</span>
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