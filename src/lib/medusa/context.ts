import { getCurrentRegion } from "./region"
import { getCurrentLocale } from "./locale"

/**
 * 获取当前region和locale组合信息
 */
export interface CurrentContext {
    regionId: string | null
    currencyCode: string | null
    locale: string
    isReady: boolean
}

/**
 * 获取当前region和locale上下文
 */
export async function getCurrentContext(): Promise<CurrentContext> {
    try {
        const [region, locale] = await Promise.all([
            getCurrentRegion(),
            getCurrentLocale()
        ])

        return {
            regionId: region?.id || null,
            currencyCode: region?.currency_code || null,
            locale,
            isReady: !!(region?.id && locale)
        }
    } catch (error) {
        console.error("获取当前上下文失败:", error)
        return {
            regionId: null,
            currencyCode: null,
            locale: "en-US",
            isReady: false
        }
    }
}

/**
 * 获取region ID和locale（简化版）
 */
export async function getRegionAndLocale(): Promise<{
    regionId: string | null
    locale: string
}> {
    const context = await getCurrentContext()
    return {
        regionId: context.regionId,
        locale: context.locale
    }
}