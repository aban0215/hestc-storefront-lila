"use server"

import { sdk } from "@lib/config"
import { sortProducts } from "@lib/util/sort-products"
import { HttpTypes } from "@medusajs/types"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { getRegion, retrieveRegion } from "./regions"
import { normalizeImageUrl } from "@lib/util/normalize-image-url"

function normalizeProductImages(product: HttpTypes.StoreProduct): HttpTypes.StoreProduct {
  if (product.thumbnail) {
    product.thumbnail = normalizeImageUrl(product.thumbnail) || product.thumbnail
  }
  if (product.images) {
    product.images = product.images.map(img => ({
      ...img,
      url: normalizeImageUrl(img.url) || img.url,
    }))
  }
  return product
}

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

  // 获取 Region
  let region: HttpTypes.StoreRegion | undefined | null
  if (countryCode) {
    region = await getRegion(countryCode)
  } else {
    region = await retrieveRegion(regionId!)
  }

  if (!region) return { response: { products: [], count: 0 }, nextPage: null }

  // 1. 变量解析
  const limit = queryParams?.limit || 12
  const _pageParam = Math.max(pageParam, 1)
  const { color, size, material, collection, category_id, order, ...rest } = queryParams || {}

  // 2. 构建基础 Query
  const query: any = {
    ...rest,
    limit: 96, // 拿足够多数据供前端过滤（8页×12条），避免以前limit=1000导致18MB/6s的查询
    region_id: region?.id,
    order: order,
    // 确保包含 material 字段
    fields: "*variants.calculated_price,+variants.inventory_quantity,*variants.images,+metadata,+tags,+material,+variants.options,+variants.options.option,+collection",
  }

  if (category_id) {
    query["category_id"] = Array.isArray(category_id) ? category_id : [category_id]
  }

  const headers = { ...(await getAuthHeaders()) }

  return sdk.client
      .fetch<{ products: HttpTypes.StoreProduct[]; count: number }>(
          `/store/products`,
          {
            method: "GET",
            query,
            headers,
            cache: "force-cache",
          }
      )
      .then(({ products, count }) => {
        // 归一化图片 URL：localhost:9000 → abanopen.tech
        products = products.map(normalizeProductImages)

        /**
         * 核心辅助工具：标准化字符串并进行比对
         * @param exact 为 true 时执行全等匹配 (用于 Size, Color)
         * @param exact 为 false 时执行包含匹配 (用于 Material)
         */
        const safeMatch = (target: string | string[], value: any, exact = false) => {
          if (!value) return false
          const targets = Array.isArray(target) ? target : [target]

          const normalize = (str: string) =>
              String(str)
                  .toLowerCase()
                  .replace(/%25|%2b/g, '')
                  .replace(/[^a-z0-9]/g, '')

          return targets.some(t => {
            const normT = normalize(t)
            const normV = normalize(String(value))

            if (exact) {
              // 全等匹配：解决 XL 包含 L 的问题
              return normV === normT
            }
            // 包含匹配：解决 90% Nylon 包含 Nylon 的问题
            return normV.includes(normT) || normT.includes(normV)
          })
        }

        let filtered = products

        // --- A. 变体过滤 (Color & Size) ---
        // 尺码和颜色开启 exact 模式，防止短字符相互干扰
        if (color || size) {
          filtered = filtered.filter(product =>
              product.variants?.some(variant => {
                const matchesColor = color ? variant.options?.some(opt => safeMatch(color, opt.value, true)) : true
                const matchesSize = size ? variant.options?.some(opt => safeMatch(size, opt.value, true)) : true
                return matchesColor && matchesSize
              })
          )
        }

        // --- B. 系列过滤 (Collection) ---
        if (collection) {
          filtered = filtered.filter(p =>
              safeMatch(collection, p.collection?.handle, true) ||
              safeMatch(collection, p.collection?.title, true)
          )
        }

        // --- C. 材质过滤 (Material) ---
        if (material) {
          filtered = filtered.filter(p => {
            const prodMaterialValue = (p as any).material
            // 材质不需要全等，包含即可匹配
            return safeMatch(material, prodMaterialValue, false)
          })
        }

        // --- 4. 手动处理分页逻辑 ---
        const finalCount = filtered.length
        const manualOffset = (_pageParam - 1) * limit
        const paginatedProducts = filtered.slice(manualOffset, manualOffset + limit)

        console.log(`------------------------------------------`)
        console.log(`[精准过滤报告]`)
        console.log(`- 原始数据: ${products.length} 条`)
        console.log(`- 过滤后: ${finalCount} 条 (Size XL 排除 L: 已开启)`)
        console.log(`------------------------------------------`)

        const nextPage = finalCount > manualOffset + limit ? _pageParam + 1 : null

        return {
          response: {
            products: paginatedProducts,
            count: finalCount,
          },
          nextPage,
          queryParams,
        }
      })
      .catch((error) => {
        console.error("Failed to list products:", error.message)
        return {
          response: { products: [], count: 0 },
          nextPage: null,
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
      limit: 96,
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