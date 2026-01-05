import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ProductInfoProps = {
    product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
    // 调试辅助：检查控制台看看 subtitle 是否有数据
    console.log("Product Info Debug:", product)

    return (
        <div id="product-info">
            <div className="flex flex-col gap-y-4 lg:max-w-[500px] mx-auto">
                {/* 系列链接 */}
                {product.collection && (
                    <LocalizedClientLink
                        href={`/collections/${product.collection.handle}`}
                        className="text-medium text-ui-fg-muted hover:text-ui-fg-subtle"
                    >
                        {product.collection.title}
                    </LocalizedClientLink>
                )}

                <div className="flex flex-col gap-y-2">
                    {/* 主标题 */}
                    <Heading
                        level="h2"
                        className="text-3xl leading-10 text-ui-fg-base"
                        data-testid="product-title"
                    >
                        {product.title || "Untitled Product"}
                    </Heading>

                    {/* 副标题 - 仅在存在时显示 */}
                    {product.subtitle && (
                        <Text
                            className="text-lg text-ui-fg-subtle"
                            data-testid="product-subtitle"
                        >
                            {product.subtitle}
                        </Text>
                    )}
                </div>

                {/* 商品描述 - 调整为 text-xl，比之前稍微缩小一点点 */}
                <Text
                    className="text-xl leading-normal text-ui-fg-base whitespace-pre-line"
                    data-testid="product-description"
                >
                    {product.description}
                </Text>
            </div>
        </div>
    )
}

export default ProductInfo