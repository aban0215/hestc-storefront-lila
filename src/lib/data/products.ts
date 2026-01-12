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
    limit: 100, // 拿回足够多的数据供前端进行精准二次过滤
    offset: 0,
    region_id: region?.id,
    order: order,
    fields: "*variants.calculated_price,+variants.inventory_quantity,*variants.images,+metadata,+tags,+variants.options,+variants.options.option,+collection",
  }

  if (category_id) {
    query["category_id"] = Array.isArray(category_id) ? category_id : [category_id]
  }

  const headers = { ...(await getAuthHeaders()) }

  // 3. 发起请求并在 .then 中执行“脱敏标准化”过滤
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
        /**
         * 核心辅助工具：标准化字符串并进行比对
         * 解决 URL 编码 (%25, +)、空格、大小写、特殊符号导致的匹配失败
         */
        const safeMatch = (target: string | string[], value: any) => {
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

            // --- 核心调试：如果材质匹配不到，看这里打印了什么 ---
            if (t.includes("%") || String(value).includes("%")) {
              console.log(`[材质比对中] 标准化目标: ${normT} <==> 标准化数据库值: ${normV}`)
            }

            return normV.includes(normT) || normT.includes(normV)
          })
        }


        let filtered = products

        // --- A. 变体过滤 (Color & Size) ---
        if (color || size) {
          filtered = filtered.filter(product =>
              product.variants?.some(variant => {
                const matchesColor = color ? variant.options?.some(opt => safeMatch(color, opt.value)) : true
                const matchesSize = size ? variant.options?.some(opt => safeMatch(size, opt.value)) : true
                return matchesColor && matchesSize
              })
          )
        }

        // --- B. 系列过滤 (Collection) ---
        if (collection) {
          filtered = filtered.filter(p =>
              safeMatch(collection, p.collection?.handle) ||
              safeMatch(collection, p.collection?.title)
          )
        }

        // --- C. 材质过滤 (Material / Metadata) ---
        if (material) {
          filtered = filtered.filter(p => {
            // 1. 获取所有可能的材质来源
            // 来源A: 产品本身的 metadata
            const prodMaterial = p.metadata?.material

            // 来源B: 产品下所有变体的 metadata (有些采集工具会存在变体里)
            const variantMaterials = p.variants?.map(v => v.metadata?.material).filter(Boolean) || []

            // 2. 汇总这些来源
            const allPossibleValues = [prodMaterial, ...variantMaterials]

            // 3. 执行标准化匹配
            return allPossibleValues.some(val => safeMatch(material, val))
          })
        }

        // --- 4. 手动处理分页逻辑 ---
        const finalCount = filtered.length
        const manualOffset = (_pageParam - 1) * limit
        const paginatedProducts = filtered.slice(manualOffset, manualOffset + limit)

        console.log(`------------------------------------------`)
        console.log(`[脱敏过滤报告]`)
        console.log(`- 目标材质: ${material}`)
        console.log(`- 原始数据: ${products.length} 条`)
        console.log(`- 过滤后: ${finalCount} 条`)
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