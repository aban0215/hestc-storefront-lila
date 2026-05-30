import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getCategoryByHandle, listCategories } from "@lib/data/categories"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import CategoryTemplate from "@modules/categories/templates"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getBaseURL } from "@lib/util/env"
import { getSelectedLocale } from "@lib/data/locales"
import { getMarketingBySlug } from "@lib/strapi/market"
import { getSeoExtension } from "@lib/strapi/seo"

type Props = {
  params: Promise<{ category: string[]; countryCode: string }>
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
    color?: string | string[]
    size?: string | string[]
    material?: string | string[]
    collection?: string | string[]
  }>
}

function getAllCategoryIds(rootCategory: any, allCategories: any[]): string[] {
  // 从全量扁平列表构建 parent → children 映射，递归收集所有子孙 ID
  const childrenMap = new Map<string, string[]>()
  allCategories.forEach((cat: any) => {
    const pid = cat.parent_category_id || cat.parent_category?.id
    if (pid) {
      if (!childrenMap.has(pid)) childrenMap.set(pid, [])
      childrenMap.get(pid)!.push(cat.id)
    }
  })

  function collectDescendants(id: string): string[] {
    const children = childrenMap.get(id) || []
    let ids = [id]
    children.forEach(cid => {
      ids = [...ids, ...collectDescendants(cid)]
    })
    return ids
  }

  return collectDescendants(rootCategory.id)
}

export async function generateStaticParams() {
  try {
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
  } catch (error) {
    console.error("generateStaticParams categories error:", error)
    return []
  }
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { category, countryCode } = await props.params

  if (!category || category.length === 0) notFound()

  const categoryHandle = category[category.length - 1]
  const localecode = (await getSelectedLocale()) || 'en-US'

  const [productCategory, seoPatch] = await Promise.all([
    getCategoryByHandle(category),
    getSeoExtension(categoryHandle, localecode) // 这里传的是 string
  ])

  if (!productCategory) notFound()

  const baseUrl = getBaseURL()
  const canonicalUrl = `${baseUrl}/${countryCode}/categories/${category.join("/")}`

  return {
    title: seoPatch?.metaTitle || productCategory.name,
    description: seoPatch?.metaDescription || productCategory.description,
    keywords: seoPatch?.keywords,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: seoPatch?.metaTitle || productCategory.name,
      description: seoPatch?.metaDescription || productCategory.description,
      images: seoPatch?.shareImage?.url ? [seoPatch.shareImage.url] : [],
    }
  }
}

export default async function CategoryPage(props: Props) {
  const searchParams = await props.searchParams
  const params = await props.params
  const { sortBy, page } = searchParams
  const { category, countryCode } = params

  if (!category || category.length === 0) notFound()

  const localecode = (await getSelectedLocale()) || 'en-US'

  // 获取分类层级的最后一个 handle
  const categoryHandle = category[category.length - 1]

  const [productCategory, allCategories, marketingData] = await Promise.all([
    getCategoryByHandle(category),
    listCategories(),
    getMarketingBySlug(categoryHandle, localecode)
  ])

  if (!productCategory) notFound()
  const allCategoryIds = getAllCategoryIds(productCategory, allCategories)

  return (
      <CategoryTemplate
          category={productCategory}
          marketingData={marketingData}
          allCategoryIds={allCategoryIds}
          sortBy={sortBy}
          page={page}
          countryCode={countryCode}
          searchParams={searchParams}
      />
  )
}