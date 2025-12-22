"use server"

import { sdk } from "@lib/config"
import { getCacheOptions } from "./cookies"
import { getLocale, setLocale } from "./cookies"

export type Locale = {
  code: string
  name: string
}

/**
 * Fetches available locales from the backend.
 * Returns null if the endpoint returns 404 (locales not configured).
 */
export const listLocales = async (): Promise<Locale[] | null> => {
  const next = {
    ...(await getCacheOptions("locales")),
  }

  return sdk.client
    .fetch<{ locales: Locale[] }>(`/store/locales`, {
      method: "GET",
      next,
      cache: "force-cache",
    })
    .then(({ locales }) => locales)
    .catch((error) => {
      // Return null on 404 to hide selector
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

export async function getSelectedLocale() {
  let localeCode = await getLocale()

  if (!localeCode) {
    const locales = await getLocales()
    localeCode = locales.locales.find((l) => l.is_default)?.code
  }

  return localeCode
}

export async function setSelectedLocale(locale: string) {
  await setLocale(locale)
}