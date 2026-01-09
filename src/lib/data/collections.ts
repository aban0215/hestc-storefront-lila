"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"

export const retrieveCollection = async (id: string) => {
  const next = {
    ...(await getCacheOptions("collections")),
  }

  return sdk.client
    .fetch<{ collection: HttpTypes.StoreCollection }>(
      `/store/collections/${id}`,
      {
        next,
        cache: "force-cache",
      }
    )
    .then(({ collection }) => collection)
}

export const listCollections = async (
    queryParams: Record<string, any> = {}
): Promise<{ collections: HttpTypes.StoreCollection[]; count: number }> => {
    const next = await getCacheOptions("collections")

    // 合并参数，确保 limit 和 offset 有保底
    const query = {
        limit: 100,
        offset: 0,
        ...queryParams,
    }

    return sdk.client
        .fetch<HttpTypes.StoreCollectionListResponse>(
            "/store/collections",
            {
                query,
                next,
                cache: "force-cache",
            }
        )
        .then((res) => ({
            collections: res.collections,
            // 兼容逻辑：如果后端没返 count (极少见)，则回退到长度
            count: res.count !== undefined ? res.count : res.collections.length
        }))
}


export const getCollectionByHandle = async (
  handle: string
): Promise<HttpTypes.StoreCollection> => {
  const next = {
    ...(await getCacheOptions("collections")),
  }

  return sdk.client
    .fetch<HttpTypes.StoreCollectionListResponse>(`/store/collections`, {
      query: { handle, fields: "*products" },
      next,
      cache: "force-cache",
    })
    .then(({ collections }) => collections[0])
}
