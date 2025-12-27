import { Metadata } from "next"
import { notFound } from "next/navigation"
import { listProducts } from "@lib/data/products"
import { getRegion, listRegions } from "@lib/data/regions"
import ProductTemplate from "@modules/products/templates"
import { HttpTypes } from "@medusajs/types"
import { getProductStrapiContent } from "../../../../../lib/strapi/product-content"

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
  searchParams: Promise<{ v_id?: string }>
}

export async function generateStaticParams() {
  try {
    const countryCodes = await listRegions().then((regions) =>
        regions?.map((r) => r.countries?.map((c) => c.iso_2)).flat()
    )

    if (!countryCodes) {
      return []
    }

    const promises = countryCodes.map(async (country) => {
      const { response } = await listProducts({
        countryCode: country,
        queryParams: { limit: 100, fields: "handle" },
      })

      return {
        country,
        products: response.products,
      }
    })

    const countryProducts = await Promise.all(promises)

    return countryProducts
        .flatMap((countryData) =>
            countryData.products.map((product) => ({
              countryCode: countryData.country,
              handle: product.handle,
            }))
        )
        .filter((param) => param.handle)
  } catch (error) {
    console.error(
        `Failed to generate static paths for product pages: ${
            error instanceof Error ? error.message : "Unknown error"
        }.`
    )
    return []
  }
}

function getImagesForVariant(
    product: HttpTypes.StoreProduct,
    selectedVariantId?: string
) {
  if (!selectedVariantId || !product.variants) {
    return product.images
  }

  const variant = product.variants!.find((v) => v.id === selectedVariantId)
  if (!variant || !variant.images.length) {
    return product.images
  }

  const imageIdsMap = new Map(variant.images.map((i) => [i.id, true]))
  return product.images!.filter((i) => imageIdsMap.has(i.id))
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { handle } = params
  const region = await getRegion(params.countryCode)

  if (!region) {
    notFound()
  }

  const product = await listProducts({
    countryCode: params.countryCode,
    queryParams: { handle },
  }).then(({ response }) => response.products[0])

  if (!product) {
    notFound()
  }

  return {
    title: `${product.title} | Medusa Store`,
    description: `${product.title}`,
    openGraph: {
      title: `${product.title} | Medusa Store`,
      description: `${product.title}`,
      images: product.thumbnail ? [product.thumbnail] : [],
    },
  }
}

export default async function ProductPage(props: Props) {
  const params = await props.params
  const searchParams = await props.searchParams
  const { handle, countryCode } = params
  const selectedVariantId = searchParams.v_id

  // 1. 获取 Region 信息
  const region = await getRegion(countryCode)
  if (!region) {
    notFound()
  }

  // 2. 并行获取 Medusa 商品数据和 Strapi 增强内容
  // 这种写法比 await 两次更快，因为它同时发起两个网络请求
  const [medusaData, strapiContent] = await Promise.all([
    listProducts({
      countryCode: countryCode,
      queryParams: { handle: handle },
    }).then(({ response }) => response.products[0]),
    getProductStrapiContent(handle)
  ])

  // 3. 基础校验
  if (!medusaData) {
    notFound()
  }

  // 4. 处理变体图片逻辑
  const images = getImagesForVariant(medusaData, selectedVariantId)

  return (
      <ProductTemplate
          product={medusaData}
          strapiContent={strapiContent} // 将 Strapi 内容传递给模板
          region={region}
          countryCode={countryCode}
          images={images}
      />
  )
}