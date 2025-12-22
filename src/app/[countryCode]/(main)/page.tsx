import { Metadata } from "next"

import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import HeroSection from '../../components/home/hero-section'
import CategoryShowcase from '../../components/home/category-showcase'
import NewArrivalPromo from '../../components/home/new-arrival-promo'
import BestSellers from '../../components/home/best-sellers'
import BlogShowcase from '../../components/home/blog-showcase'

export const metadata: Metadata = {
  title: "Medusa Next.js Starter Template",
  description:
    "A performant frontend ecommerce starter template with Next.js 15 and Medusa.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params

  const { countryCode } = params

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
        <CategoryShowcase />
        <NewArrivalPromo />
        <BestSellers
            regionId={region.id}
        />
        <BlogShowcase />  {/* 新增博客展示 */}
        {/* 其他组件将在后续添加 */}
      </div>
    </>
  )
}
