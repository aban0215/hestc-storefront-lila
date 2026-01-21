import { HttpTypes } from "@medusajs/types"
import { Heading } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ProductInfoProps = {
    product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
    return (
        <div id="product-info">
            <div className="flex flex-col gap-y-4 lg:max-w-[500px] mx-auto">
                {/* 系列链接 - 保留原样 */}
                {product.collection && (
                    <LocalizedClientLink
                        href={`/collections/${product.collection.handle}`}
                        className="text-medium text-ui-fg-muted hover:text-ui-fg-subtle"
                    >
                        {product.collection.title}
                    </LocalizedClientLink>
                )}

                <div className="flex flex-col gap-y-2">
                    {/* 主标题 - 字体大小、样式、ID均未变动 */}
                    <Heading
                        level="h2"
                        className="text-3xl leading-10 text-ui-fg-base"
                        data-testid="product-title"
                    >
                        {product.title || "Untitled Product"}
                    </Heading>
                </div>

                {/* 副标题和描述已移除 */}
            </div>
        </div>
    )
}

export default ProductInfo