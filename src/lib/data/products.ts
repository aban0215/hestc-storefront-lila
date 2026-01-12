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

  // 2. 构建基础 Query (只传后端 100% 支持的参数)
  const query: any = {
    ...rest,
    limit: 100, // 拿回尽可能多的数据供前端过滤
    offset: 0,  // 前端过滤时，我们手动处理分页，所以 offset 传 0
    region_id: region?.id,
    order: order,
    // 关键：带上所有关联字段，特别是 +variants.options.option
    fields: "*variants.calculated_price,+variants.inventory_quantity,*variants.images,+metadata,+tags,+variants.options,+variants.options.option,+collection",
  }

  if (category_id) {
    query["category_id"] = Array.isArray(category_id) ? category_id : [category_id]
  }

  const headers = { ...(await getAuthHeaders()) }

  // 3. 发起请求并在 .then 中执行“降维打击”过滤
  return sdk.client
      .fetch<{ products: HttpTypes.StoreProduct[]; count: number }>(
          `/store/products`,
          {
            method: "GET",
            query,
            headers,
            cache: "no-store",
          }
      )
      .then(({ products, count }) => {
        let filtered = products

        // --- A. 变体过滤 (Color & Size) ---
        // 逻辑：只要有一个变体满足（选中的颜色 AND 选中的尺码），该产品就保留
        if (color || size) {
          const targetColors = color ? (Array.isArray(color) ? color : [color]) : null
          const targetSizes = size ? (Array.isArray(size) ? size : [size]) : null

          filtered = filtered.filter(product =>
              product.variants?.some(variant => {
                const matchesColor = targetColors
                    ? variant.options?.some(opt => targetColors.includes(opt.value))
                    : true
                const matchesSize = targetSizes
                    ? variant.options?.some(opt => targetSizes.includes(opt.value))
                    : true
                return matchesColor && matchesSize
              })
          )
        }

        // --- B. 系列过滤 (Collection) ---
        if (collection) {
          const targetCollections = Array.isArray(collection) ? collection : [collection]
          filtered = filtered.filter(p =>
              p.collection?.handle && targetCollections.includes(p.collection.handle) ||
              p.collection?.title && targetCollections.includes(p.collection.title)
          )
        }

        // --- C. 材质过滤 (Material - 匹配 Metadata) ---
        if (material) {
          const targetMaterials = Array.isArray(material) ? material : [material]
          filtered = filtered.filter(p => {
            const prodMaterial = p.metadata?.material
            if (!prodMaterial) return false
            // 支持模糊匹配，比如 "90% Nylon" 匹配 "Nylon"
            return targetMaterials.some(m => String(prodMaterial).toLowerCase().includes(m.toLowerCase()))
          })
        }

        // --- 4. 手动处理分页逻辑 ---
        const finalCount = filtered.length
        const manualOffset = (_pageParam - 1) * limit
        const paginatedProducts = filtered.slice(manualOffset, manualOffset + limit)

        console.log(`------------------------------------------`)
        console.log(`[前端强力过滤报告]`)
        console.log(`- 筛选条件: Color:${color}, Size:${size}, Collection:${collection}`)
        console.log(`- 原始数据: ${products.length} 条`)
        console.log(`- 过滤后数据: ${finalCount} 条`)
        console.log(`- 当前页显示: ${paginatedProducts.length} 条`)
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