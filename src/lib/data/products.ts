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
  queryParams?: any
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
  const offset = (_pageParam - 1) * limit

  let region: HttpTypes.StoreRegion | undefined | null
  if (countryCode) {
    region = await getRegion(countryCode)
  } else {
    region = await retrieveRegion(regionId!)
  }

  if (!region) {
    return {
      response: { products: [], count: 0 },
      nextPage: null,
    }
  }

  // --- 调试：1. 变量解析检查 ---
  console.log("------------------------------------------")
  console.log("[调试-1-变量解析] URL 参数详情:", {
    color: queryParams?.color,
    size: queryParams?.size,
    collection: queryParams?.collection,
    material: queryParams?.material,
  })

  const { color, size, material, collection, category_id, order, ...rest } = queryParams || {}

  const query: any = {
    ...rest,
    limit,
    offset,
    region_id: region?.id,
    order: order,
    fields: "*variants.calculated_price,+variants.inventory_quantity,*variants.images,+metadata,+tags,+variants.options",
  }

  if (category_id) {
    query["category_id"] = Array.isArray(category_id) ? category_id : [category_id]
  }

  const andFilters: any[] = []

  // A. Color & Size
  if (color || size) {
    const optionValues: string[] = []
    if (color) optionValues.push(...(Array.isArray(color) ? color : [color]))
    if (size) optionValues.push(...(Array.isArray(size) ? size : [size]))

    if (optionValues.length > 0) {
      andFilters.push({
        variants: {
          options: {
            value: optionValues
          }
        }
      })
    }
  }

  // B. Collection
  if (collection) {
    andFilters.push({
      collection: {
        handle: Array.isArray(collection) ? collection : [collection]
      }
    })
  }

  // C. Material
  if (material) {
    andFilters.push({
      metadata: {
        material: Array.isArray(material) ? material : [material]
      }
    })
  }

  if (andFilters.length > 0) {
    query["$and"] = andFilters
  }

  // --- 调试：2. 请求体检查 ---
  // 这是发给 Medusa 的最终 Query 对象，你可以对比官方文档看看结构对不对
  console.log("[调试-2-请求JSON] 发往 Medusa 的完整 Query:", JSON.stringify(query, null, 2))

  const headers = { ...(await getAuthHeaders()) }
  const next = { ...(await getCacheOptions("products")) }

  return sdk.client
      .fetch<{ products: HttpTypes.StoreProduct[]; count: number }>(
          `/store/products`,
          {
            method: "GET",
            query,
            headers,
            next,
            cache: "no-store",
          }
      )
      .then(({ products, count }) => {
        // --- 调试：3. 结果检查 ---
        console.log(`[调试-3-响应统计] 过滤后返回商品数: ${products.length}, 数据库命中总数: ${count}`)

        if (products.length > 0) {
          // 打印第一个产品的变体信息，对比 URL 参数，看看为什么没被过滤掉
          const firstVariantOptions = products[0].variants?.[0]?.options
          console.log("[调试-3-详情] 第一个商品的第一个变体 Options 结构:", JSON.stringify(firstVariantOptions, null, 2))
        }
        console.log("------------------------------------------")

        const nextPage = count > offset + limit ? _pageParam + 1 : null

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
  queryParams?: any // 这里的类型改为 any
  sortBy?: SortOptions
  countryCode: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: any
}> => {
  const limit = queryParams?.limit || 12

  // --- 关键修改：确保 queryParams 里的所有东西（color, size等）都传给 listProducts ---
  const { response: { products, count } } = await listProducts({
    pageParam: 0,
    queryParams: {
      ...queryParams, // 这里的三个点非常重要！它把 color, size, material 全部透传下去
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