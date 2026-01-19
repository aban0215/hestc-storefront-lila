import { Metadata } from "next"
import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import HeroSection from '../../components/home/hero-section'
import CategoryShowcase from '../../components/home/category-showcase'
import NewArrivalPromo from '../../components/home/new-arrival-promo'
import BestSellers from '../../components/home/best-sellers'
import BlogShowcase from '../../components/home/blog-showcase'
import { getBaseURL } from "@lib/util/env"


const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;

type Props = {
  params: Promise<{ countryCode: string }>
}

/**
 * 根据接口返回结构适配的首页 SEO 获取函数
 * 强制使用 en-US 实现单中心索引
 */
async function getHomepageSeo() {
  // 适配你的最新接口：key 为 homepage-key，组件名为 lilaSeo
  const query = `${STRAPI_URL}/api/lila-seo-extensions?filters[key][$eq]=homepage-key&locale=en-US&populate[lilaSeo][populate]=shareImage`

  try {
    const res = await fetch(query, { next: { revalidate: 3600 } })
    const { data } = await res.json()

    // 对应数据结构：data[0].lilaSeo[0]
    return data?.[0]?.lilaSeo?.[0] || null
  } catch (error) {
    console.error("Homepage SEO fetch error:", error)
    return null
  }
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { countryCode } = params

  // 1. 获取 Strapi 中的英文 SEO 补丁
  const seo = await getHomepageSeo()

  // 2. 锁定 Canonical URL
  const baseUrl = getBaseURL()
  const mainCountry = "us"
  const canonicalUrl = `${baseUrl}/${mainCountry}`

  return {
    title: seo?.metaTitle || "Home",
    description: seo?.metaDescription,
    keywords: seo?.keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: seo?.metaTitle,
      description: seo?.metaDescription,
      url: canonicalUrl,
      // 适配返回的 shareImage 数组结构
      images: seo?.shareImage?.[0]?.url ? [seo.shareImage[0].url] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: seo?.metaTitle,
      description: seo?.metaDescription,
      images: seo?.shareImage?.[0]?.url ? [seo.shareImage[0].url] : [],
    }
  }
}

export default async function Home(props: Props) {
  const params = await props.params
  const { countryCode } = params

  // 1. 获取业务逻辑所需的 Region 和 Collections
  const region = await getRegion(countryCode)
  const { collections } = await listCollections({
    fields: "id, handle, title",
  })

  if (!collections || !region) {
    return null
  }

  return (
      <>
        <div className="min-h-screen">
          <HeroSection />
          <div className="py-8 md:py-16">
            <div className="px-4 mb-8 text-center">
              <h2 className="text-xl md:text-2xl font-bold uppercase tracking-[0.2em]">Our Favorites</h2>
              <p className="text-gray-400 text-xs mt-2">Designed for movement, styled for life.</p>
            </div>
            <BestSellers regionId={region.id} />
          </div>
          <CategoryShowcase />
          <NewArrivalPromo />
          {/*<BestSellers regionId={region.id} />*/}
          <BlogShowcase />
        </div>
      </>
  )
}