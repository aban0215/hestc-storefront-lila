// lib/medusa/region.ts
import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"

/**
 * 获取当前region ID（从localStorage）
 */
export function getCurrentRegionId(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem("region_id")
}

/**
 * 根据region ID获取region详情
 */
export async function getRegionById(regionId: string): Promise<HttpTypes.StoreRegion | null> {
    try {
        const { region } = await sdk.store.region.retrieve(regionId)
        return region
    } catch (error) {
        console.error(`获取region详情失败 regionId=${regionId}:`, error)
        return null
    }
}

/**
 * 获取所有可用的regions
 */
export async function getAllRegions(): Promise<HttpTypes.StoreRegion[]> {
    try {
        const { regions } = await sdk.store.region.list()
        return regions || []
    } catch (error) {
        console.error("获取regions列表失败:", error)
        return []
    }
}

/**
 * 设置当前region（保存到localStorage）
 */
export function setCurrentRegion(regionId: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem("region_id", regionId)
}

/**
 * 获取默认region（通常是第一个）
 */
export async function getDefaultRegion(): Promise<HttpTypes.StoreRegion | null> {
    try {
        const regions = await getAllRegions()
        return regions[0] || null
    } catch (error) {
        console.error("获取默认region失败:", error)
        return null
    }
}

/**
 * 获取当前region（优先从localStorage，没有则取默认）
 */
export async function getCurrentRegion(): Promise<HttpTypes.StoreRegion | null> {
    try {
        const regionId = getCurrentRegionId()

        if (regionId) {
            const region = await getRegionById(regionId)
            if (region) return region
        }

        // 如果没有保存的regionId或获取失败，返回默认region
        return await getDefaultRegion()
    } catch (error) {
        console.error("获取当前region失败:", error)
        return null
    }
}