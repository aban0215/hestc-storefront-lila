import { listProductsWithSort } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductPreview from "@modules/products/components/product-preview"
import { Pagination } from "@modules/store/components/pagination"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

const PRODUCT_LIMIT = 12

type PaginatedProductsParams = {
  limit: number
  collection_id?: string[]
  category_id?: string[]
  id?: string[]
  order?: string
}

export default async function PaginatedProducts({
                                                  sortBy,
                                                  page,
                                                  collectionId,
                                                  categoryId,
                                                  productsIds,
                                                  countryCode,
                                                }: {
  sortBy?: SortOptions
  page: number
  collectionId?: string
  categoryId?: string | string[]
  productsIds?: string[]
  countryCode: string
}) {
  const queryParams: PaginatedProductsParams = {
    limit: PRODUCT_LIMIT,
  }

  if (collectionId) {
    queryParams["collection_id"] = [collectionId]
  }

  if (categoryId) {
    queryParams["category_id"] = Array.isArray(categoryId)
        ? categoryId
        : [categoryId]
  }

  if (productsIds) {
    queryParams["id"] = productsIds
  }

  if (sortBy === "created_at") {
    queryParams["order"] = "created_at"
  }

  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  let {
    response: { products, count },
  } = await listProductsWithSort({
    page,
    queryParams,
    sortBy,
    countryCode,
  })

  const totalPages = Math.ceil(count / PRODUCT_LIMIT)

    return (
        <>
            {/* 每行显示5个商品，无间隙平铺 */}
            <ul
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 w-full"
                data-testid="products-list"
            >
                {products.map((p) => {
                    return (
                        <li
                            key={p.id}
                            className="group transition-colors duration-200"
                        >
                            {/* 商品项容器 */}
                            <div className="p-4 h-full flex flex-col">
                                <ProductPreview product={p} region={region} />
                            </div>

                            {/* 悬停效果 */}
                            <div className="absolute inset-0 border-2 border-transparent group-hover:border-gray-200 pointer-events-none transition-colors duration-200" />
                        </li>
                    )
                })}
            </ul>

            {/* 分页组件 - 添加内边距 */}
            {totalPages > 1 && (
                <div className="mt-12 pb-12 px-4">
                    <Pagination
                        data-testid="product-pagination"
                        page={page}
                        totalPages={totalPages}
                    />
                </div>
            )}
        </>
    )
}