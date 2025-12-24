import { sdk } from "@lib/config"
import { getAuthHeaders, getCacheOptions } from "@lib/data/cookies"
import { HttpTypes } from "@medusajs/types"
import {
    getCurrencySymbol,
    formatPrice,
    formatPriceFromObject,
    getPriceComparison
} from '@lib/medusa/currency'

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
        // 优先使用商品缩略图
        if (product.thumbnail) {
            return product.thumbnail
        }

        // 如果没有缩略图，使用第一个变体的第一张图片
        if (product.variants?.[0]?.images?.[0]?.url) {
            return product.variants[0].images[0].url
        }

        // 最后尝试使用商品的第一张图片
        if (product.images?.[0]?.url) {
            return product.images[0].url
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