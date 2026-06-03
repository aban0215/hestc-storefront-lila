export const revalidate = 3600

import { Metadata } from "next"
import { notFound } from "next/navigation"
import { listProducts } from "@lib/data/products"
import { getRegion, listRegions } from "@lib/data/regions"
import ProductTemplate from "@modules/products/templates"
import { HttpTypes } from "@medusajs/types"
import { getProductStrapiContent } from "../../../../../lib/strapi/product-content"
import { getBaseURL } from "@lib/util/env"
import { normalizeImageUrl } from "@lib/util/normalize-image-url"

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
  searchParams: Promise<{ v_id?: string }>
}

/**
 * 专门为 Metadata 获取 Strapi SEO 数据的函数
 * 强制请求 en-US，确保单中心索引
 */
async function getProductSeoForMetadata(handle: string) {
  const query = `${STRAPI_URL}/api/lila-product-contents?filters[medusa_handle][$eq]=${handle}&locale=en-US&populate=*`

  try {
    const res = await fetch(query, { next: { revalidate: 3600 } })
    const { data } = await res.json()
    return data?.[0]?.productSeo?.[0] || null
  } catch (error) {
    console.error("Metadata fetch error:", error)
    return null
  }
}

export const dynamicParams = true

export async function generateStaticParams() {
  try {
    const { response } = await listProducts({
      countryCode: "us",
      queryParams: { limit: 10, fields: "handle" },
    })

    return (response.products || [])
        .filter((p: any) => p.handle)
        .map((product: any) => ({
          countryCode: "us",
          handle: product.handle,
        }))
  } catch (error) {
    console.error("generateStaticParams products error:", error)
    return []
  }
}

function getImagesForVariant(
    product: HttpTypes.StoreProduct,
    selectedVariantId?: string
) {
  if (!product.images || !selectedVariantId || !product.variants) {
    return product.images || []
  }

  const variant = product.variants.find((v) => v.id === selectedVariantId)

  if (!variant || !variant.images || !variant.images.length) {
    return product.images
  }

  const imageIdsMap = new Map(variant.images.map((i) => [i.id, true]))
  return product.images.filter((i) => imageIdsMap.has(i.id))
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { handle, countryCode } = params

  const [product, strapiSeo] = await Promise.all([
    listProducts({
      countryCode: countryCode,
      queryParams: { handle },
    }).then(({ response }) => response.products[0]),
    getProductSeoForMetadata(handle)
  ])

  if (!product) {
    notFound()
  }

  const baseUrl = getBaseURL()
  const mainCountry = "us"
  const canonicalUrl = `${baseUrl}/${mainCountry}/products/${handle}`

  const ogImage = strapiSeo?.shareImage?.url || normalizeImageUrl(product.thumbnail)

  return {
    title: strapiSeo?.metaTitle || product.title,
    description: strapiSeo?.metaDescription || product.description,
    keywords: strapiSeo?.keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: strapiSeo?.metaTitle || product.title,
      description: strapiSeo?.metaDescription || product.description,
      images: ogImage ? [ogImage] : [],
      url: canonicalUrl,
      type: "video.other",
    },
    twitter: {
      card: "summary_large_image",
      images: ogImage ? [ogImage] : [],
    }
  }
}

export default async function ProductPage(props: Props) {
  const params = await props.params
  const searchParams = await props.searchParams
  const { handle, countryCode } = params
  const selectedVariantId = searchParams.v_id

  const region = await getRegion(countryCode)
  if (!region) {
    notFound()
  }

  const [medusaData, strapiContent] = await Promise.all([
    listProducts({
      countryCode: countryCode,
      queryParams: {
        handle: handle,
        fields: "title,handle,subtitle,description,*variants,*variants.images,*images,*type,material,origin_country,weight"
      },
    }).then(({ response }) => response.products[0]),
    getProductStrapiContent(handle)
  ])
  if (!medusaData) {
    notFound()
  }

  const images = getImagesForVariant(medusaData, selectedVariantId)

  return (
      <ProductTemplate
          product={medusaData}
          strapiContent={strapiContent}
          region={region}
          countryCode={countryCode}
          images={images}
      />
  )
}