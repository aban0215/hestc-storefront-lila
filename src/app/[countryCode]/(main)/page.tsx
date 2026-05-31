import { Metadata } from "next"
import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import HeroSection from '../../components/home/hero-section'
import CategoryShowcase from '../../components/home/category-showcase'
import CollectionsSection from '../../components/home/collections-section'
import BlogShowcase from '../../components/home/blog-showcase'
import MasonryLatest from '../../components/home/masonry-latest'
import { getBaseURL } from "@lib/util/env"
import LotteryModal from "@modules/home/components/lottery-modal"
import { getSeoExtension } from "@lib/strapi/seo"
import { retrieveCustomer } from "@lib/data/customer"

type Props = {
  params: Promise<{ countryCode: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { countryCode } = params

  // 1. 获取 Strapi 中的英文 SEO 补丁
  const seo = await getSeoExtension('home')

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
      images: seo?.shareImage?.url ? [seo.shareImage.url] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: seo?.metaTitle,
      description: seo?.metaDescription,
      images: seo?.shareImage?.url ? [seo.shareImage.url] : [],
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

  const customer = await retrieveCustomer()

  if (!collections || !region) {
    return null
  }

  return (
      <>
        <LotteryModal
          isLoggedIn={!!customer}
          customerEmail={customer?.email}
        />
        <div className="min-h-screen">
          <HeroSection />
          <CollectionsSection region={region} />
          <CategoryShowcase region={region} />
          <MasonryLatest region={region} />
          <BlogShowcase />
        </div>
      </>
  )
}