import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  // 调试辅助：如果标题不显示，请取消下面这行的注释
  console.log("Product Info Debug:", product)

  return (
      <div id="product-info">
        <div className="flex flex-col gap-y-4 lg:max-w-[500px] mx-auto">
          {product.collection && (
              <LocalizedClientLink
                  href={`/collections/${product.collection.handle}`}
                  className="text-medium text-ui-fg-muted hover:text-ui-fg-subtle"
              >
                {product.collection.title}
              </LocalizedClientLink>
          )}

          {/* 标题排查：如果 product.title 为空，这里就不会显示任何内容 */}
          <Heading
              level="h2"
              className="text-3xl leading-10 text-ui-fg-base"
              data-testid="product-title"
          >
            {product.title || "Untitled Product"}
          </Heading>

          <Text
              className="text-2xl leading-normal text-ui-fg-base whitespace-pre-line"
              data-testid="product-description"
          >
            {product.description}
          </Text>
        </div>
      </div>
  )
}

export default ProductInfo