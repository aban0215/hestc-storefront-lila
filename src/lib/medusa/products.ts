import { sdk } from "@lib/config"
import { getAuthHeaders, getCacheOptions } from "@lib/data/cookies"
import { HttpTypes } from "@medusajs/types"
import {
    getCurrencySymbol,
    formatPrice,
    formatPriceFromObject,
    getPriceComparison
} from '@lib/medusa/currency'
import { normalizeImageUrl } from "@lib/util/normalize-image-url"

/**
 * 根据多个handles批量获取商品
 * @param handles 商品handle数组
 * @param countryCode 国家代码
 * @returns 商品数据数组
 */
export async function getProductsByHandles(
    handles: string[],
    countryCode: string = 'us'
): Promise<HttpTypes.StoreProduct[]> {
    try {
        if (handles.length === 0) {
            return []
        }
        // 清理handles并去重
        const cleanHandles = handles
            .map(h => h.replace(/^\//, ''))
            .filter(h => h.trim() !== '')
            .filter((value, index, self) => self.indexOf(value) === index) // 去重

        if (cleanHandles.length === 0) {
            return []
        }


        const headers = {
            ...(await getAuthHeaders()),
        }

        const next = {
            ...(await getCacheOptions("products")),
        }

        // 调用Medusa API批量获取商品
        const response = await sdk.client.fetch<{ products: HttpTypes.StoreProduct[], count: number }>(
            `/store/products`,
            {
                method: "GET",
                query: {
                    handle: cleanHandles,
                    region_id: countryCode,
                    limit: cleanHandles.length,
                    fields: "*variants.calculated_price,+variants.inventory_quantity,*variants.images,+metadata,+tags",
                },
                headers,
                next,
                cache: "force-cache",
            }
        )
        console.log(response)
        return response.products || []
    } catch (error) {
        console.error(`批量获取商品失败:`, error)
        return []
    }
}

/**
 * 获取商品价格字符串
 */
export function getProductPrice(product: any,currencycode: string): string {
    try {
        // 直接访问 calculated_amount
        const amount = product.variants?.[0]?.calculated_price?.calculated_amount

        if (amount !== undefined && amount !== null) {
            return `${amount}` + ' ' +  getCurrencySymbol(currencycode)
        }
    } catch (error) {
        console.error('获取商品价格失败:', error)
        return '价格待定'
    }
}

/**
 * 获取商品缩略图URL
 * @param product 商品数据
 * @returns 缩略图URL或null
 */
export function getProductThumbnail(product: HttpTypes.StoreProduct): string | null {
    try {
        if (product.thumbnail) {
            return normalizeImageUrl(product.thumbnail)
        }
        if (product.variants?.[0]?.images?.[0]?.url) {
            return normalizeImageUrl(product.variants[0].images[0].url)
        }
        if (product.images?.[0]?.url) {
            return normalizeImageUrl(product.images[0].url)
        }
        return null
    } catch (error) {
        console.error('获取商品缩略图失败:', error)
        return null
    }
}

/**
 * 获取商品简化信息（用于首页展示）
 */
export interface SimplifiedProduct {
    handle: string
    title: string
    thumbnail: string | null
    price: string
    originalHandle: string // 原始handle（可能包含斜杠）
}

/**
 * 根据handles获取商品简化信息
 */
export async function getSimplifiedProducts(
    handles: string[],
    regionId: string = 'us',
    currencycode: string = '',
): Promise<SimplifiedProduct[]> {
    try {
        const products = await getProductsByHandles(handles, regionId)

        // 创建handle到商品的映射
        const productMap = new Map<string, HttpTypes.StoreProduct>()
        products.forEach(product => {
            if (product.handle) {
                productMap.set(product.handle, product)
            }
        })

        // 构建简化商品信息，保持原始顺序
        return handles.map(originalHandle => {
            const cleanHandle = originalHandle.replace(/^\//, '')
            const product = productMap.get(cleanHandle)

            if (!product) {
                return {
                    handle: originalHandle,
                    title: `商品 ${cleanHandle}`,
                    thumbnail: null,
                    price: '价格待定',
                    originalHandle
                }
            }

            return {
                handle: originalHandle,
                title: product.title || `商品 ${cleanHandle}`,
                thumbnail: getProductThumbnail(product),
                price: getProductPrice(product,currencycode),
                originalHandle
            }
        })
    } catch (error) {
        console.error('获取简化商品信息失败:', error)

        // 返回占位信息
        return handles.map(originalHandle => ({
            handle: originalHandle,
            title: `商品加载失败`,
            thumbnail: null,
            price: '价格待定',
            originalHandle
        }))
    }
}


/**
 * 根据 Collection Handle 获取该系列下的商品
 */
export async function getProductsByCollectionHandle(
    collectionHandle: string,
    regionId: string,
    currencyCode: string,
    limit: number = 6
): Promise<SimplifiedProduct[]> {
    try {
        const headers = { ...(await getAuthHeaders()) };

        // 1. 获取 Collection ID
        const collectionRes = await sdk.client.fetch<{ collections: any[] }>(
            `/store/collections`,
            {
                method: "GET",
                query: { handle: (collectionHandle || '').replace(/^\//, ''), limit: 1 },
                headers,
                // 统一缓存策略，确保排序和新商品实时更新
                cache: "no-store",
            }
        )

        const collectionId = collectionRes.collections?.[0]?.id
        if (!collectionId) return []

        // 2. 查询商品
        const response = await sdk.client.fetch<{ products: HttpTypes.StoreProduct[] }>(
            `/store/products`,
            {
                method: "GET",
                query: {
                    collection_id: [collectionId],
                    region_id: regionId,
                    limit: limit,
                    // 排序对齐：列表页用的是 created_at，这里加上负号确保新货在前
                    order: "-created_at",
                    // 字段对齐：参考 listProducts 补充了 metadata, tags, material 等
                    fields: "*variants.calculated_price,+variants.inventory_quantity,*variants.images,+metadata,+tags,+material,+variants.options,+variants.options.option,+collection",
                },
                headers,
                cache: "no-store",
            }
        )

        return response.products.map(product => ({
            handle: product.handle!,
            title: product.title!,
            thumbnail: getProductThumbnail(product),
            price: getProductPrice(product, currencyCode),
            originalHandle: product.handle!
        }))
    } catch (error) {
        console.error(`获取 Collection 商品失败:`, error)
        return []
    }
}



/**
 * 根据 Category Handle 获取该分类下的商品
 */
export async function getProductsByCategoryHandle(
    categoryHandle: string,
    regionId: string,
    currencyCode: string,
    limit: number = 6
): Promise<SimplifiedProduct[]> {
    try {
        const headers = { ...(await getAuthHeaders()) };

        // 1. 获取 Category 及子分类
        const categoryRes = await sdk.client.fetch<{ product_categories: any[] }>(
            `/store/product-categories`,
            {
                method: "GET",
                query: {
                    handle: (categoryHandle || '').replace(/^\//, ''),
                    limit: 1,

                },
                headers,
                cache: "no-store",
            }
        )

        const category = categoryRes.product_categories?.[0]
        if (!category) {
            console.warn(`未找到分类: ${categoryHandle}`)
            return []
        }

        // 收集父分类 + 所有子分类的 ID
        const categoryIds = [category.id]
        if (category.category_children) {
            for (const child of category.category_children) {
                categoryIds.push(child.id)
            }
        }

        // 2. 查询该分类及子分类下的商品
        const response = await sdk.client.fetch<{ products: HttpTypes.StoreProduct[] }>(
            `/store/products`,
            {
                method: "GET",
                query: {
                    category_id: categoryIds,
                    region_id: regionId,
                    limit: limit,
                    order: "-created_at",
                    fields: "*variants.calculated_price,+variants.inventory_quantity,*variants.images,+metadata,+tags,+material,+variants.options,+variants.options.option,+collection",
                },
                headers,
                cache: "no-store",
            }
        )

        // 3. 转换为前端简化的商品格式
        return response.products.map(product => ({
            handle: product.handle!,
            title: product.title!,
            thumbnail: getProductThumbnail(product),
            price: getProductPrice(product, currencyCode),
            originalHandle: product.handle!
        }))
    } catch (error) {
        console.error(`获取 Category 商品失败 (${categoryHandle}):`, error)
        return []
    }
}