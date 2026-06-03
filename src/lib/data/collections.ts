"use server"

import { HttpTypes } from "@medusajs/types"

// 公共 API，移除 getCacheOptions 以避免 cookies() 禁用 ISR

const MEDUSA_BACKEND = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

export const retrieveCollection = async (id: string) => {
  try {
    const res = await fetch(`${MEDUSA_BACKEND}/store/collections/${id}`, {
      headers: { "x-publishable-api-key": PUBLISHABLE_KEY },
      cache: "force-cache",
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    return data.collection as HttpTypes.StoreCollection
  } catch (error: any) {
    console.error("Failed to retrieve collection:", error.message)
    return null as any
  }
}

export const listCollections = async (
    queryParams: Record<string, any> = {}
): Promise<{ collections: HttpTypes.StoreCollection[]; count: number }> => {
    const params = new URLSearchParams()
    params.set("limit", String(queryParams.limit || 100))
    params.set("offset", String(queryParams.offset || 0))
    if (queryParams.fields) params.set("fields", queryParams.fields)

    try {
      const res = await fetch(`${MEDUSA_BACKEND}/store/collections?${params.toString()}`, {
        headers: { "x-publishable-api-key": PUBLISHABLE_KEY },
        cache: "force-cache",
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      return {
        collections: data.collections || [],
        count: data.count ?? data.collections?.length ?? 0,
      }
    } catch (error: any) {
      console.error("Failed to list collections:", error.message)
      return { collections: [], count: 0 }
    }
}

export const getCollectionByHandle = async (
  handle: string
): Promise<HttpTypes.StoreCollection> => {
  const params = new URLSearchParams()
  params.set("handle", handle)
  params.set("fields", "id,title,handle")

  try {
    const res = await fetch(`${MEDUSA_BACKEND}/store/collections?${params.toString()}`, {
      headers: { "x-publishable-api-key": PUBLISHABLE_KEY },
      cache: "force-cache",
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    return (data.collections?.[0] || null) as HttpTypes.StoreCollection
  } catch (error: any) {
    console.error(`Failed to fetch collection "${handle}":`, error.message)
    return null as any
  }
}
