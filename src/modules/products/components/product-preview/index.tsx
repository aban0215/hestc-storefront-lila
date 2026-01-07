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
          <Thumbnail
              thumbnail={product.thumbnail}
              images={product.images}
              size="full"
              isFeatured={isFeatured}
          />

          {/* 内容区域：改为垂直排列 */}
          <div className="mt-4 flex flex-col items-center text-center px-2">
            {/* 标题：允许折行或者超过两行省略 */}
            <Text
                className="text-[13px] md:text-sm text-gray-900 font-normal uppercase tracking-wider line-clamp-2 min-h-[2.5rem]"
                data-testid="product-title"
            >
              {product.title}
            </Text>

            {/* 价格：放在下方，稍作间距 */}
            <div className="mt-2 text-gray-500 font-light">
              {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
            </div>
          </div>
        </div>
      </LocalizedClientLink>
  )
}