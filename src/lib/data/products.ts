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
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductListParams
  countryCode?: string
  regionId?: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductListParams
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
    return {
      response: { products: [], count: 0 },
      nextPage: null,
    }
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("products")),
  }

  return sdk.client
    .fetch<{ products: HttpTypes.StoreProduct[]; count: number }>(
      `/store/products`,
      {
        method: "GET",
        query: {
          limit,
          offset,
          region_id: region?.id,
          fields:
            "*variants.calculated_price,+variants.inventory_quantity,*variants.images,+metadata,+tags,",
          ...queryParams,
        },
        headers,
        next,
        cache: "no-store",
      }
    )
    .then(({ products, count }) => {
      const nextPage = count > offset + limit ? pageParam + 1 : null

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
                                             page = 1,
                                             queryParams,
                                             sortBy = "created_at",
                                             countryCode,
                                           }: {
  page?: number
  queryParams?: any
  sortBy?: SortOptions
  countryCode: string
}) => {
  // 1. 这里的 limit 从 queryParams 拿，或者默认为 12
  const limit = queryParams?.limit || 12

  // 2. 【核心改动】不再写死 limit: 100，而是把所有参数透传给 listProducts
  const {
    response: { products, count },
    nextPage
  } = await listProducts({
    pageParam: page,      // 把当前页码传下去，让 listProducts 计算 offset
    queryParams: {
      ...queryParams,    // 这里面包含了我们的 tag_value, variants.options.value 等
      limit: limit,      // 使用真实的分页限制
    },
    countryCode,
  })

  // 3. 【核心改动】删掉原来这里的 .slice(...) 逻辑
  // 因为 listProducts 已经根据 pageParam 和 limit 帮我们分好页了

  return {
    response: {
      products, // 直接返回后端分好页、滤好后的数据
      count,
    },
    nextPage,
    queryParams,
  }
}