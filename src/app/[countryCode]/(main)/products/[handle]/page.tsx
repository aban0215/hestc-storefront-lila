import { Metadata } from "next"
import { notFound } from "next/navigation"
import { listProducts } from "@lib/data/products"
import { getRegion, listRegions } from "@lib/data/regions"
import ProductTemplate from "@modules/products/templates"
import { HttpTypes } from "@medusajs/types"
import { getProductStrapiContent } from "../../../../../lib/strapi/product-content"
import { getBaseURL } from "@lib/util/env"

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
  // 仅请求 SEO 核心字段，减少体积
  const query = `${STRAPI_URL}/api/lila-product-contents?filters[medusa_handle][$eq]=${handle}&locale=en-US&populate[productSeo][populate]=shareImage`

  try {
    const res = await fetch(query, { next: { revalidate: 3600 } })
    const { data } = await res.json()
    return data?.[0]?.productSeo?.[0] || null
  } catch (error) {
    console.error("Metadata fetch error:", error)
    return null
  }
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
  // 增加对 product.images 的保护
  if (!product.images || !selectedVariantId || !product.variants) {
    return product.images || [] // 如果 images 也是空的，返回空数组
  }

  const variant = product.variants.find((v) => v.id === selectedVariantId)

  // 增加对 variant.images 的保护
  if (!variant || !variant.images || !variant.images.length) {
    return product.images
  }

  const imageIdsMap = new Map(variant.images.map((i) => [i.id, true]))
  return product.images.filter((i) => imageIdsMap.has(i.id))
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { handle, countryCode } = params

  // 1. 并行获取 Medusa 商品基础信息和 Strapi 英文 SEO 补丁
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

  // 2. 确定主域名和 Canonical URL (固定指向 US 站)
  const baseUrl = getBaseURL()
  const mainCountry = "us"
  const canonicalUrl = `${baseUrl}/${mainCountry}/products/${handle}`

  // 3. 确定分享图片 (优先使用 Strapi SEO 图片，回退到 Medusa 缩略图)
  const ogImage = strapiSeo?.shareImage?.url || product.thumbnail

  return {
    // 这里的 %s 会自动替换到 Root Layout 的 title.template 中
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
      type: "video.other", // 电商商品通常建议用 website 或 article，如果是视频页则用 video
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

  // 1. 获取 Region 信息
  const region = await getRegion(countryCode)
  if (!region) {
    notFound()
  }

  // 2. 获取业务内容
  const [medusaData, strapiContent] = await Promise.all([
    listProducts({
      countryCode: countryCode,
      queryParams: {
        handle: handle,
        // 必须包含 *images 和 *variants，否则 getImagesForVariant 会崩溃
        fields: "title,handle,subtitle,description,*variants,*variants.images,*images,*type,material,origin_country,weight"
      },
    }).then(({ response }) => response.products[0]),
    getProductStrapiContent(handle)
  ])
  if (!medusaData) {
    notFound()
  }

  // 3. 处理变体图片
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