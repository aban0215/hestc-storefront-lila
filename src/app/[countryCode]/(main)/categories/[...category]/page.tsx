// app/[countryCode]/categories/[...category]/page.tsx

import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getCategoryByHandle, listCategories } from "@lib/data/categories"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import CategoryTemplate from "@modules/categories/templates"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getBaseURL } from "@lib/util/env"

type Props = {
  params: Promise<{ category: string[]; countryCode: string }>
  searchParams: Promise<{ sortBy?: SortOptions; page?: string }>
}

// 提取 SEO 的 Helper 函数
async function getCategorySeoPatch() {
  const STRAPI_URL = "http://47.89.151.64:1337"
  const query = `${STRAPI_URL}/api/lila-seo-extensions?filters[key][$eq]=category-key&locale=en-US&populate[lilaSeo][populate]=shareImage`
  try {
    const res = await fetch(query, { next: { revalidate: 3600 } })
    const { data } = await res.json()
    return data?.[0]?.lilaSeo?.[0] || null
  } catch (e) { return null }
}

// ... getAllCategoryIds 和 generateStaticParams 保持不变 ...
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

  if (!product_categories) {
    return []
  }

  const countryCodes = await listRegions().then((regions: StoreRegion[]) =>
      regions?.map((r) => r.countries?.map((c) => c.iso_2)).flat()
  )

  const categoryHandles = product_categories.map(
      (category: any) => category.handle
  )

  const staticParams = countryCodes
      ?.map((countryCode: string | undefined) =>
          categoryHandles.map((handle: any) => ({
            countryCode,
            category: [handle],
          }))
      )
      .flat()

  return staticParams
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { category, countryCode } = await props.params

  // 并行请求：Medusa 分类数据 + Strapi SEO 补丁
  const [productCategory, seoPatch] = await Promise.all([
    getCategoryByHandle(category),
    getCategorySeoPatch()
  ])

  if (!productCategory) notFound()

  const baseUrl = getBaseURL()
  const canonicalUrl = `${baseUrl}/us/categories/${category.join("/")}`

  return {
    // 优先使用补丁，如果没有补丁则用 Medusa 分类名兜底
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
  const searchParams = await props.searchParams
  const params = await props.params
  const { sortBy, page } = searchParams
  const productCategory = await getCategoryByHandle(params.category)
  if (!productCategory) notFound()
  const allCategoryIds = getAllCategoryIds(productCategory)

  return (
      <CategoryTemplate
          category={productCategory}
          allCategoryIds={allCategoryIds}
          sortBy={sortBy}
          page={page}
          countryCode={params.countryCode}
      />
  )
}