import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getCategoryByHandle, listCategories } from "@lib/data/categories"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import CategoryTemplate from "@modules/categories/templates"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

type Props = {
  params: Promise<{ category: string[]; countryCode: string }>
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
  }>
}

/**
 * 递归获取当前分类及其所有子分类的 ID
 * 确保点击父分类时能查询到所有子孙分类的商品
 */
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
  const params = await props.params
  try {
    const productCategory = await getCategoryByHandle(params.category)

    const title = productCategory.name + " | Medusa Store"

    const description = productCategory.description ?? `${title} category.`

    return {
      title: `${title} | Medusa Store`,
      description,
      alternates: {
        canonical: `${params.category.join("/")}`,
      },
    }
  } catch (error) {
    notFound()
  }
}

export default async function CategoryPage(props: Props) {
  const searchParams = await props.searchParams
  const params = await props.params
  const { sortBy, page } = searchParams

  // 1. 获取当前分类详情
  const productCategory = await getCategoryByHandle(params.category)

  if (!productCategory) {
    notFound()
  }

  // 2. 提取父子全量 ID 数组
  const allCategoryIds = getAllCategoryIds(productCategory)

  return (
      <CategoryTemplate
          category={productCategory}
          allCategoryIds={allCategoryIds} // 传递新计算的 ID 数组
          sortBy={sortBy}
          page={page}
          countryCode={params.countryCode}
      />
  )
}