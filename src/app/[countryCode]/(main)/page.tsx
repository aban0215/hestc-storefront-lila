export const revalidate = 3600

import { Metadata } from "next"
import { Suspense } from "react"
import { getRegion } from "@lib/data/regions"
import HeroSection from '../../components/home/hero-section'
import HeroSkeleton from '../../components/home/hero-skeleton'
import CategoryShowcase from '../../components/home/category-showcase'
import CollectionsSection from '../../components/home/collections-section'
import BlogShowcase from '../../components/home/blog-showcase'
import MasonryLatest from '../../components/home/masonry-latest'
import { getBaseURL } from "@lib/util/env"
import LotteryModalWrapper from "./lottery-wrapper"
import { getSeoExtension } from "@lib/strapi/seo"

type Props = {
  params: Promise<{ countryCode: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { countryCode } = params

  const seo = await getSeoExtension('home')
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

export default function Home(props: Props) {
  return (
    <>
      <Suspense fallback={null}>
        <LotteryModalWrapper />
      </Suspense>

      <div className="min-h-screen">
        {/* LCP 关键区块 — 优先渲染 */}
        <Suspense fallback={<HeroSkeleton />}>
          <HeroSection />
        </Suspense>

        {/* 其余区块 — 不阻塞页面，流式加载 */}
        <Suspense fallback={<SectionSkeleton />}>
          <CollectionsSectionWrapper params={props.params} />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <CategoryShowcaseWrapper params={props.params} />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <MasonryLatestWrapper params={props.params} />
        </Suspense>

        <Suspense fallback={null}>
          <BlogShowcase />
        </Suspense>
      </div>
    </>
  )
}

// ── Wrapper components that fetch their own data ──

async function CollectionsSectionWrapper({ params }: { params: Promise<{ countryCode: string }> }) {
  const { countryCode } = await params
  const region = await getRegion(countryCode)
  return <CollectionsSection region={region} />
}

async function CategoryShowcaseWrapper({ params }: { params: Promise<{ countryCode: string }> }) {
  const { countryCode } = await params
  const region = await getRegion(countryCode)
  return <CategoryShowcase region={region} />
}

async function MasonryLatestWrapper({ params }: { params: Promise<{ countryCode: string }> }) {
  const { countryCode } = await params
  const region = await getRegion(countryCode)
  return <MasonryLatest region={region} />
}

function SectionSkeleton() {
  return (
    <div className="w-full py-16 flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="h-4 bg-gray-200 rounded w-48" />
        <div className="h-8 bg-gray-200 rounded w-64" />
      </div>
    </div>
  )
}
