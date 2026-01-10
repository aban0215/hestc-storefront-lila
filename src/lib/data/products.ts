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
  queryParams?: any // 提升兼容性，接收自定义过滤字段
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

  // --- 1. 提取自定义过滤参数 ---
  const { color, size, material, collection, category_id, order, ...rest } = queryParams || {}

  // --- 2. 组装 Medusa V2 官方认可的基础参数 ---
  const query: any = {
    ...rest,
    limit,
    offset,
    region_id: region?.id,
    order: order,
    // 必须包含 variants.options 才能让后端执行选项值匹配
    fields: "*variants.calculated_price,+variants.inventory_quantity,*variants.images,+metadata,+tags,+variants.options",
  }

  // 如果有分类 ID，直接放入
  if (category_id) {
    query["category_id"] = Array.isArray(category_id) ? category_id : [category_id]
  }

  // --- 3. 构建 $and 高级过滤逻辑 ---
  const andFilters: any[] = []

  // A. 处理颜色 (Color) 和 尺码 (Size) - 匹配变体选项
  if (color || size) {
    const optionValues: string[] = []
    if (color) {
      const colors = Array.isArray(color) ? color : [color]
      optionValues.push(...colors)
    }
    if (size) {
      const sizes = Array.isArray(size) ? size : [size]
      optionValues.push(...sizes)
    }

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

  // B. 处理系列 (Collection) - 支持 Handle 匹配
  if (collection) {
    const collections = Array.isArray(collection) ? collection : [collection]
    andFilters.push({
      collection: {
        handle: collections
      }
    })
  }

  // C. 处理材质 (Material) - 假设存放在产品的 Metadata 中
  if (material) {
    const materials = Array.isArray(material) ? material : [material]
    andFilters.push({
      metadata: {
        material: materials
      }
    })
  }

  // 将构建好的过滤器注入查询对象
  if (andFilters.length > 0) {
    query["$and"] = andFilters
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("products")),
  }

  // --- 4. 发起请求 ---
  return sdk.client
      .fetch<{ products: HttpTypes.StoreProduct[]; count: number }>(
          `/store/products`,
          {
            method: "GET",
            query, // 此时 query 包含了复杂的 $and 结构
            headers,
            next,
            cache: "no-store", // 建议调试阶段设为 no-store，确保即时生效
          }
      )
      .then(({ products, count }) => {
        const nextPage = count > offset + limit ? _pageParam + 1 : null

        return {
          response: {
            products,
            count,
          },
          nextPage: nextPage,
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