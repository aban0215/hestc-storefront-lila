import { sdk } from "@lib/config"
import { cookies } from 'next/headers'

export type Locale = {
    name: string
    code: string
    is_default: boolean
}

/**
 * 从cookie获取当前locale
 */
export async function getCurrentLocaleFromCookie(): Promise<string | null> {
    try {
        const cookieStore = await cookies()
        const locale = cookieStore.get("_medusa_locale")?.value
        return locale || null
    } catch (error) {
        console.error("从cookie获取locale失败:", error)
        return null
    }
}

/**
 * 获取所有可用的locales
 */
export async function getAllLocales(): Promise<Locale[]> {
    try {
        const { locales } = await sdk.client.fetch<{ locales: Locale[] }>("/store/locales")
        return locales || []
    } catch (error) {
        console.error("获取locales列表失败:", error)
        return []
    }
}

/**
 * 获取默认locale（标记为is_default的）
 */
export async function getDefaultLocale(): Promise<string | null> {
    try {
        const locales = await getAllLocales()
        const defaultLocale = locales.find(l => l.is_default)
        return defaultLocale?.code || locales[0]?.code || null
    } catch (error) {
        console.error("获取默认locale失败:", error)
        return null
    }
}

/**
 * 获取当前选中的locale（优先从cookie，没有则取默认）
 */
export async function getCurrentLocale(): Promise<string> {
    try {
        // 1. 从cookie获取
        const cookieLocale = await getCurrentLocaleFromCookie()
        if (cookieLocale) return cookieLocale

        // 2. 获取默认locale
        const defaultLocale = await getDefaultLocale()
        return defaultLocale || "en-US"
    } catch (error) {
        console.error("获取当前locale失败:", error)
        return "en-US"
    }
}

/**
 * 设置当前locale（保存到cookie）
 */
export async function setCurrentLocale(locale: string): Promise<void> {
    try {
        const cookieStore = await cookies()
        cookieStore.set("_medusa_locale", locale, {
            maxAge: 60 * 60 * 24 * 7, // 7天
            path: "/",
        })
    } catch (error) {
        console.error("设置locale到cookie失败:", error)
    }
}

/**
 * 检查locale是否可用
 */
export async function isValidLocale(localeCode: string): Promise<boolean> {
    try {
        const locales = await getAllLocales()
        return locales.some(l => l.code === localeCode)
    } catch (error) {
        console.error("检查locale有效性失败:", error)
        return false
    }
}