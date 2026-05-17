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
import { getSeoExtension } from "@lib/strapi/seo"

export const dynamic = "force-dynamic"

type Props = {
  params: Promise<{ handle: string; countryCode: string }>
  searchParams: Promise<{ page?: string; sortBy?: SortOptions }>
}



export async function generateStaticParams() {
  try {
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
  } catch (error) {
    console.error("generateStaticParams collections error:", error)
    return []
  }
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { handle, countryCode } = await props.params
  const localecode = (await getSelectedLocale()) || 'en-US'

  const [collection, seoPatch] = await Promise.all([
    getCollectionByHandle(handle),
    getSeoExtension(handle, localecode)
  ])

  if (!collection) notFound()

  const baseUrl = getBaseURL()
  const title = seoPatch?.metaTitle || `${collection.title} | mybrand`
  const description = seoPatch?.metaDescription || `Shop the latest ${collection.title} yoga wear at mybrand.`

  return {
    title: title,
    description: description,
    keywords: seoPatch?.keywords,
    alternates: {
      canonical: `${baseUrl}/${countryCode}/collections/${handle}`
    },
    openGraph: {
      title: title,
      description: description,
      images: seoPatch?.shareImage?.url ? [seoPatch.shareImage.url] : [],
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
          searchParams={searchParams}
      />
  )
}