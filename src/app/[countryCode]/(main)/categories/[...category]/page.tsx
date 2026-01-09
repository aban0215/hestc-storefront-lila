import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getCategoryByHandle, listCategories } from "@lib/data/categories"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import CategoryTemplate from "@modules/categories/templates"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getBaseURL } from "@lib/util/env"
// 引入语言和营销数据抓取工具
import { getSelectedLocale } from "@lib/data/locales"
import { getMarketingBySlug } from "@lib/strapi/market"

type Props = {
  params: Promise<{ category: string[]; countryCode: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;

async function getCategorySeoPatch() {
  const query = `${STRAPI_URL}/api/lila-seo-extensions?filters[key][$eq]=category-key&locale=en-US&populate[lilaSeo][populate]=shareImage`
  try {
    const res = await fetch(query, { next: { revalidate: 3600 } })
    const { data } = await res.json()
    return data?.[0]?.lilaSeo?.[0] || null
  } catch (e) { return null }
}

function getAllCategoryIds(category: any): string[] {
  let ids = [category.id]
  if (category.category_children && category.category_children.length > 0) {
    category.category_children.forEach((child: any) => {
      ids = [...ids, ...getAllCategoryIds(child)]
    })
  }
  return ids
}

export async function generateStaticParams() {
  const product_categories = await listCategories()
  if (!product_categories) return []

  const countryCodes = await listRegions().then((regions: StoreRegion[]) =>
      regions?.map((r) => r.countries?.map((c) => c.iso_2)).flat()
  )

  const categoryHandles = product_categories.map((category: any) => category.handle)

  return countryCodes?.map((countryCode: string | undefined) =>
      categoryHandles.map((handle: any) => ({
        countryCode,
        category: [handle],
      }))
  ).flat()
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { category } = await props.params
  const [productCategory, seoPatch] = await Promise.all([
    getCategoryByHandle(category),
    getCategorySeoPatch()
  ])

  if (!productCategory) notFound()

  const baseUrl = getBaseURL()
  const canonicalUrl = `${baseUrl}/us/categories/${category.join("/")}`

  return {
    title: seoPatch?.metaTitle || productCategory.name,
    description: seoPatch?.metaDescription || productCategory.description,
    keywords: seoPatch?.keywords,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: seoPatch?.metaTitle || productCategory.name,
      images: seoPatch?.shareImage?.[0]?.url ? [seoPatch.shareImage[0].url] : [],
    }
  }
}

export default async function CategoryPage(props: Props) {
  // 【核心修复】获取所有的 searchParams
  const searchParams = await props.searchParams
  const params = await props.params

  // 原有的逻辑保持不变
  const { sortBy, page } = searchParams as any
  const localecode = (await getSelectedLocale()) || 'en-US'
  const categoryHandle = params.category[params.category.length - 1]

  const [productCategory, marketingData] = await Promise.all([
    getCategoryByHandle(params.category),
    getMarketingBySlug(categoryHandle, localecode)
  ])

  if (!productCategory) notFound()
  const allCategoryIds = getAllCategoryIds(productCategory)

  return (
      <CategoryTemplate
          category={productCategory}
          marketingData={marketingData}
          allCategoryIds={allCategoryIds}
          sortBy={sortBy as SortOptions}
          page={page as string}
          countryCode={params.countryCode}
          searchParams={props.searchParams}
      />
  )
}