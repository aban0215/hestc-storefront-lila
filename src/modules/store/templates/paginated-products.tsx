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
  categoryId?: string | string[] // 修改点 1: 类型适配，允许传入数组
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
    // 修改点 2: 逻辑判断
    // 如果 categoryId 已经是数组（来自我们的递归函数），直接赋值
    // 如果是字符串，则按原逻辑包装成数组，确保向下兼容
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
        <ul
            className="grid grid-cols-2 w-full small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-8"
            data-testid="products-list"
        >
          {products.map((p) => {
            return (
                <li key={p.id}>
                  <ProductPreview product={p} region={region} />
                </li>
            )
          })}
        </ul>
        {totalPages > 1 && (
            <Pagination
                data-testid="product-pagination"
                page={page}
                totalPages={totalPages}
            />
        )}
      </>
  )
}