"use server"

import { sdk } from "@lib/config"
import { sdk } from "@lib/config"

export type Locale = {
  code: string
  name: string
}

/**
 * Fetches available locales from the backend.
 * 公共 API，不读 cookie，避免禁用 ISR。
 */
export const listLocales = async (): Promise<Locale[] | null> => {
  return sdk.client
    .fetch<{ locales: Locale[] }>(`/store/locales`, {
      method: "GET",
      cache: "force-cache",
    })
    .then(({ locales }) => locales)
    .catch((error) => {
      if (error?.response?.status === 404) {
        return null
      }
      console.error("Failed to fetch locales:", error)
      return null
    })
}

export type Locale = {
  name: string
  code: string
  is_default: boolean
}

export async function getLocales() {
  return await sdk.client.fetch<{ locales: Locale[] }>("/store/locales")
}

/**
 * 当前仅 en-US 市场，不读 locale cookie 以避免 cookies() 禁用 ISR。
 * 多语言上线后可从 URL countryCode 推导。
 */
export async function getSelectedLocale() {
  return "en-US"
}