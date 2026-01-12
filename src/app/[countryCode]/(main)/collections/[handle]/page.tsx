import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getCollectionByHandle, listCollections } from "@lib/data/collections"
import { listRegions } from "@lib/data/regions"
import { StoreCollection, StoreRegion } from "@medusajs/types"
import CollectionTemplate from "@modules/collections/templates"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getBaseURL } from "@lib/util/env"
import {getSelectedLocale} from "@lib/data/locales";
import {getMarketingBySlug} from "@lib/strapi/market";


export const dynamic = "force-dynamic"

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;

type Props = {
  params: Promise<{ handle: string; countryCode: string }>
  searchParams: Promise<{ page?: string; sortBy?: SortOptions }>
}



async function getCollectionSeoPatch() {
  const query = `${STRAPI_URL}/api/lila-seo-extensions?filters[key][$eq]=collection-key&locale=en-US&populate[lilaSeo][populate]=shareImage`
  try {
    const res = await fetch(query, { next: { revalidate: 3600 } })
    const { data } = await res.json()
    return data?.[0]?.lilaSeo?.[0] || null
  } catch (e) { return null }
}

export async function generateStaticParams() {
  const { collections } = await listCollections({
    fields: "*products",
  })

  if (!collections) {
    return []
  }

  const countryCodes = await listRegions().then(
      (regions: StoreRegion[]) =>
          regions
              ?.map((r) => r.countries?.map((c) => c.iso_2))
              .flat()
              .filter(Boolean) as string[]
  )

  const collectionHandles = collections.map(
      (collection: StoreCollection) => collection.handle
  )

  const staticParams = countryCodes
      ?.map((countryCode: string) =>
          collectionHandles.map((handle: string | undefined) => ({
            countryCode,
            handle,
          }))
      )
      .flat()

  return staticParams
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { handle } = await props.params

  const [collection, seoPatch] = await Promise.all([
    getCollectionByHandle(handle),
    getCollectionSeoPatch()
  ])

  if (!collection) notFound()

  const baseUrl = getBaseURL()
  const canonicalUrl = `${baseUrl}/us/collections/${handle}`

  return {
    title: seoPatch?.metaTitle || collection.title,
    description: seoPatch?.metaDescription || `${collection.title} collection`,
    keywords: seoPatch?.keywords,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: seoPatch?.metaTitle || collection.title,
      images: seoPatch?.shareImage?.[0]?.url ? [seoPatch.shareImage[0].url] : [],
    }
  }
}

export default async function CollectionPage(props: Props) {
  // 1. 获取所有的搜索参数，而不仅仅是 sortBy 和 page
  const searchParams = await props.searchParams
  const params = await props.params

  // 解构出基础参数，同时保留其他的（color, size, material 等）
  const { sortBy, page, ...restSearchParams } = searchParams

  const localecode = (await getSelectedLocale()) || 'en-US'

  const [collection, { collections }, marketingData] = await Promise.all([
    getCollectionByHandle(params.handle),
    listCollections({ limit: 100 }),
    getMarketingBySlug(params.handle, localecode)
  ])

  if (!collection) notFound()

  return (
      <CollectionTemplate
          collection={collection}
          collections={collections}
          page={page}
          sortBy={sortBy}
          countryCode={params.countryCode}
          marketingData={marketingData}
          // 2. 关键：把剩下的筛选参数全部传进去
          searchParams={searchParams}
      />
  )
}