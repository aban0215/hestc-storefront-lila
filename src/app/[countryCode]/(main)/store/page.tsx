import { Metadata } from "next"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreTemplate from "@modules/store/templates"

export const metadata: Metadata = {
  title: "Store",
  description: "Explore all of our products.",
}

type Params = {
  // 这里的类型定义要包含你 PaginatedProducts 里支持的所有过滤字段
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
    color?: string | string[]
    size?: string | string[]
    material?: string | string[]
    collection?: string | string[]
  }>
  params: Promise<{
    countryCode: string
  }>
}

export default async function StorePage(props: Params) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { sortBy, page } = searchParams

  return (
      <StoreTemplate
          sortBy={sortBy}
          page={page}
          countryCode={params.countryCode}
          searchParams={searchParams}
      />
  )
}