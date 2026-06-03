"use server"

import { sdk } from "@lib/config"
import { sortProducts } from "@lib/util/sort-products"
import { HttpTypes } from "@medusajs/types"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
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

  const limit = queryParams?.limit || 12
  const _pageParam = Math.max(pageParam, 1)
  const { color, size, material, collection, category_id, order, fields: callerFields, ...rest } = queryParams || {}

  // 是否有客户端过滤条件 → 决定走"大池子"还是"真分页"
  const hasFilters = !!(color || size || material || collection)

  const query: any = {
    ...rest,
    // 有过滤：拉 24 条池子供客户端过滤；无过滤：按页取，Medusa 服务端分页
    limit: hasFilters ? 24 : limit,
    offset: hasFilters ? 0 : (_pageParam - 1) * limit,
    region_id: region?.id,
    order: order,
  }

  // 调用方显式传 fields 则遵从；否则不设（Medusa 返回默认全量字段，供 PDP 等场景使用）
  if (callerFields) {
    query.fields = callerFields
  }

  if (category_id) {
    query["category_id"] = Array.isArray(category_id) ? category_id : [category_id]
  }

  // 公共 Store API 不需要 auth headers，移除 cookies() 调用以启用 ISR
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
        products = products.map(normalizeProductImages)

        // 无过滤 → Medusa 已完成分页，直接返回
        if (!hasFilters) {
          return {
            response: { products, count },
            nextPage: count > _pageParam * limit ? _pageParam + 1 : null,
            queryParams,
          }
        }

        // ── 有过滤 → 客户端过滤 + 手动分页 ──

        const safeMatch = (target: string | string[], value: any, exact = false) => {
          if (!value) return false
          const targets = Array.isArray(target) ? target : [target]
          const normalize = (str: string) =>
              String(str).toLowerCase().replace(/%25|%2b/g, '').replace(/[^a-z0-9]/g, '')
          return targets.some(t => {
            const normT = normalize(t)
            const normV = normalize(String(value))
            if (exact) return normV === normT
            return normV.includes(normT) || normT.includes(normV)
          })
        }

        let filtered = products

        if (color || size) {
          filtered = filtered.filter(product =>
              product.variants?.some(variant => {
                const matchesColor = color ? variant.options?.some(opt => safeMatch(color, opt.value, true)) : true
                const matchesSize = size ? variant.options?.some(opt => safeMatch(size, opt.value, true)) : true
                return matchesColor && matchesSize
              })
          )
        }

        if (collection) {
          filtered = filtered.filter(p =>
              safeMatch(collection, p.collection?.handle, true) ||
              safeMatch(collection, p.collection?.title, true)
          )
        }

        if (material) {
          filtered = filtered.filter(p => {
            const prodMaterialValue = (p as any).material
            return safeMatch(material, prodMaterialValue, false)
          })
        }

        const finalCount = filtered.length
        const manualOffset = (_pageParam - 1) * limit
        const paginatedProducts = filtered.slice(manualOffset, manualOffset + limit)

        console.log(`------------------------------------------`)
        console.log(`[过滤报告] 池子=${products.length} 过滤后=${finalCount} 当前页=${paginatedProducts.length}`)
        console.log(`------------------------------------------`)

        return {
          response: { products: paginatedProducts, count: finalCount },
          nextPage: finalCount > manualOffset + limit ? _pageParam + 1 : null,
          queryParams,
        }
      })
      .catch((error) => {
        console.error("Failed to list products:", error.message)
        return { response: { products: [], count: 0 }, nextPage: null, queryParams }
      })
}


// 列表卡真正需要的字段：thumbnail, title, handle, images + price + 过滤字段
const LISTING_FIELDS = "*variants.calculated_price,+variants.options,+material,+collection"

/**
 * 智能分页：无过滤+created_at排序 → Medusa 服务端分页（真分页）
 *            有过滤或价格排序 → 拉 24 条池子，客户端排序/过滤后手动分页
 */
export const listProductsWithSort = async ({
                                             page = 0,
                                             queryParams,
                                             sortBy = "created_at",
                                             countryCode,
                                           }: {
  page?: number
  queryParams?: any
  sortBy?: SortOptions
  countryCode: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: any
}> => {
  const limit = queryParams?.limit || 12
  const { color, size, material, collection } = queryParams || {}
  const hasFilters = !!(color || size || material || collection)
  const needsClientSort = sortBy?.startsWith("price")

  // 需要客户端池子：价格排序（Medusa 不支持）或有过滤条件
  const needsPool = needsClientSort || hasFilters

  if (needsPool) {
    // 池子模式：拉 24 条 → 客户端排序/过滤 → 手动分页
    // 注入精简 fields，列表卡不需要 inventory_quantity / variants.images / metadata / tags
    const { response: { products, count } } = await listProducts({
      pageParam: 0,
      queryParams: { ...queryParams, limit: 24, fields: LISTING_FIELDS },
      countryCode,
    })

    const sortedProducts = sortProducts(products, sortBy)
    const pageParam = (page - 1) * limit
    const nextPage = count > pageParam + limit ? pageParam + limit : null
    const paginatedProducts = sortedProducts.slice(pageParam, pageParam + limit)

    return {
      response: { products: paginatedProducts, count },
      nextPage,
      queryParams,
    }
  }

  // 真分页模式：created_at 排序 + 无过滤 → Medusa 服务端 offset/limit
  // listProducts 内部看到 hasFilters=false，自动走 offset 分页
  return listProducts({
    pageParam: page,
    queryParams: { ...queryParams, order: "-created_at", fields: LISTING_FIELDS },
    countryCode,
  })
}