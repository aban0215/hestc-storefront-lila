import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"

export const listCategories = async (query?: Record<string, any>) => {
  const next = {
    ...(await getCacheOptions("categories")),
  }

  const limit = query?.limit || 100
  const fields = query?.fields || "id,name,handle,parent_category_id"

  return sdk.client
    .fetch<{ product_categories: HttpTypes.StoreProductCategory[] }>(
      "/store/product-categories",
      {
        query: { fields, limit, ...query },
        next,
        cache: "force-cache",
      }
    )
    .then(({ product_categories }) => product_categories)
    .catch((error: any) => {
      console.error("Failed to list categories:", error.message)
      return []
    })
}

export const getCategoryByHandle = async (categoryHandle: string[]) => {
  const handle = `${categoryHandle.join("/")}`

  const next = {
    ...(await getCacheOptions("categories")),
  }

  return sdk.client
    .fetch<HttpTypes.StoreProductCategoryListResponse>(
      `/store/product-categories`,
      {
        query: {
          fields: "id,name,handle,parent_category_id,description,rank",
          handle,
        },
        next,
        cache: "force-cache",
      }
    )
    .then(({ product_categories }) => product_categories[0])
    .catch((error: any) => {
      console.error(`Failed to fetch category "${handle}":`, error.message)
      return null
    })
}
