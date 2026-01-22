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



async function getCollectionSeoPatch(handle: string, locale: string = "en-US") {
  // 【关键修改点】：将原来的 'collection-key' 替换为 ${handle}
  const query = `${STRAPI_URL}/api/lila-seo-extensions?filters[key][$eq]=${handle}&locale=${locale}&populate[lilaSeo][populate]=shareImage`

  try {
    const res = await fetch(query, {
      next: { revalidate: 3600 } // 缓存一小时，性能起飞
    })
    const { data } = await res.json()

    // 返回匹配到 handle 的那一条 SEO 配置
    return data?.[0]?.lilaSeo?.[0] || null
  } catch (e) {
    console.error("Strapi SEO Fetch Error:", e)
    return null
  }
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
  const { handle, countryCode } = await props.params
  const localecode = (await getSelectedLocale()) || 'en-US'

  // 并行请求：一个去 Medusa 拿分类详情，一个去 Strapi 拿对应的 SEO 补丁
  const [collection, seoPatch] = await Promise.all([
    getCollectionByHandle(handle),
    getCollectionSeoPatch(handle, localecode) // 这里传入当前分类的 handle
  ])

  if (!collection) notFound()

  const baseUrl = getBaseURL()
  const title = seoPatch?.metaTitle || `${collection.title} | lilazen`
  const description = seoPatch?.metaDescription || `Shop the latest ${collection.title} yoga wear at lilazen.`

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