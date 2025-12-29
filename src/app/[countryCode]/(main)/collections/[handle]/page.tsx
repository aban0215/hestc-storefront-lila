// app/[countryCode]/collections/[handle]/page.tsx

import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getCollectionByHandle, listCollections } from "@lib/data/collections"
import { listRegions } from "@lib/data/regions"
import { StoreCollection, StoreRegion } from "@medusajs/types"
import CollectionTemplate from "@modules/collections/templates"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getBaseURL } from "@lib/util/env"

type Props = {
  params: Promise<{ handle: string; countryCode: string }>
  searchParams: Promise<{ page?: string; sortBy?: SortOptions }>
}

async function getCollectionSeoPatch() {
  const STRAPI_URL = "http://47.89.151.64:1337"
  const query = `${STRAPI_URL}/api/lila-seo-extensions?filters[key][$eq]=collection-key&locale=en-US&populate[lilaSeo][populate]=shareImage`
  try {
    const res = await fetch(query, { next: { revalidate: 3600 } })
    const { data } = await res.json()
    return data?.[0]?.lilaSeo?.[0] || null
  } catch (e) { return null }
}

// ... generateStaticParams 保持不变 ...
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
  const searchParams = await props.searchParams
  const params = await props.params
  const { sortBy, page } = searchParams

  const [collection, { collections }] = await Promise.all([
    getCollectionByHandle(params.handle),
    listCollections({ limit: 100 }),
  ])

  if (!collection) notFound()

  return (
      <CollectionTemplate
          collection={collection}
          collections={collections}
          page={page}
          sortBy={sortBy}
          countryCode={params.countryCode}
      />
  )
}