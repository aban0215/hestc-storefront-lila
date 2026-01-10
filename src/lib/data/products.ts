"use server"

import { sdk } from "@lib/config"
import { sortProducts } from "@lib/util/sort-products"
import { HttpTypes } from "@medusajs/types"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { getRegion, retrieveRegion } from "./regions"

export const listProducts = async ({
                                     pageParam = 1,
                                     queryParams,
                                     countryCode,
                                     regionId,
                                   }: {
  pageParam?: number
  queryParams?: any // 这里的类型改为 any，因为我们要传自定义过滤字段
  countryCode?: string
  regionId?: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: any
}> => {
  if (!countryCode && !regionId) {
    throw new Error("Country code or region ID is required")
  }

  const limit = queryParams?.limit || 12
  const _pageParam = Math.max(pageParam, 1)
  const offset = _pageParam === 1 ? 0 : (_pageParam - 1) * limit

  let region: HttpTypes.StoreRegion | undefined | null
  if (countryCode) {
    region = await getRegion(countryCode)
  } else {
    region = await retrieveRegion(regionId!)
  }

  if (!region) {
    return { response: { products: [], count: 0 }, nextPage: null }
  }

  // --- 核心逻辑：提取并转换过滤参数 ---
  const { color, size, material, collection, ...restParams } = queryParams || {}

  // 组装 Medusa 认可的查询对象
  const mappedQuery: any = {
    ...restParams,
    limit,
    offset,
    region_id: region?.id,
    fields: "*variants.calculated_price,+variants.inventory_quantity,*variants.images,+metadata,+tags,+variants.options", // 确保取到了 options 用于匹配
  }

  // Medusa V2 属性过滤：匹配变体选项的值
  // 如果 URL 有 ?color=Black，我们构造 variants: { options: { value: ["Black"] } }
  if (color || size) {
    mappedQuery["variants"] = {
      options: {
        value: []
      }
    }
    if (color) mappedQuery.variants.options.value.push(...(Array.isArray(color) ? color : [color]))
    if (size) mappedQuery.variants.options.value.push(...(Array.isArray(size) ? size : [size]))
  }

  // 处理 Collection (如果不是通过 category 过滤而是通过 collection 过滤)
  if (collection) {
    mappedQuery["collection_id"] = Array.isArray(collection) ? collection : [collection]
  }

  const headers = { ...(await getAuthHeaders()) }
  const next = { ...(await getCacheOptions("products")) }

  return sdk.client
      .fetch<{ products: HttpTypes.StoreProduct[]; count: number }>(
          `/store/products`,
          {
            method: "GET",
            query: mappedQuery, // 使用转换后的查询对象
            headers,
            next,
            cache: "no-store", // 调试期间建议设为 no-store，确保过滤即时生效
          }
      )
      .then(({ products, count }) => {
        const nextPage = count > offset + limit ? pageParam + 1 : null
        return {
          response: { products, count },
          nextPage,
          queryParams,
        }
      })
}

/**
 * This will fetch 100 products to the Next.js cache and sort them based on the sortBy parameter.
 * It will then return the paginated products based on the page and limit parameters.
 */
export const listProductsWithSort = async ({
  page = 0,
  queryParams,
  sortBy = "created_at",
  countryCode,
}: {
  page?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
  sortBy?: SortOptions
  countryCode: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
}> => {
  const limit = queryParams?.limit || 12

  const {
    response: { products, count },
  } = await listProducts({
    pageParam: 0,
    queryParams: {
      ...queryParams,
      limit: 100,
    },
    countryCode,
  })

  const sortedProducts = sortProducts(products, sortBy)

  const pageParam = (page - 1) * limit

  const nextPage = count > pageParam + limit ? pageParam + limit : null

  const paginatedProducts = sortedProducts.slice(pageParam, pageParam + limit)

  return {
    response: {
      products: paginatedProducts,
      count,
    },
    nextPage,
    queryParams,
  }
}
