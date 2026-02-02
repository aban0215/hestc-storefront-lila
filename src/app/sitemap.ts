import { MetadataRoute } from 'next'
import { listCategories } from "@lib/data/categories"
import { getBlogPosts } from "@lib/strapi/blog-data"
import { getBaseURL } from "@lib/util/env"
import { sdk } from "@lib/config" //
import { getRegion } from "@lib/data/regions" //

export const revalidate = 0
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = getBaseURL()
    const mainCountry = "us"

    const region = await getRegion(mainCountry)

    let allProducts: any[] = []
    let hasMore = true
    let offset = 0
    const BATCH_SIZE = 100

    try {
        while (hasMore) {
            const res = await sdk.client.fetch<{ products: any[]; count: number }>(
                `/store/products`,
                {
                    method: "GET",
                    query: {
                        limit: BATCH_SIZE,
                        offset: offset,
                        region_id: region?.id,
                        fields: "*products,*variants"
                    },
                    cache: "no-store",
                }
            )

            const { products, count } = res
            allProducts = [...allProducts, ...products]

            console.log(`Sitemap Debug: 已抓取 ${allProducts.length} / 总数 ${count}`)

            if (allProducts.length >= count || products.length === 0) {
                hasMore = false
            } else {
                offset += BATCH_SIZE
            }
        }
    } catch (error) {
        console.error("Sitemap: 获取商品数据失败", error)
    }

    // 3. 获取分类和博客
    const categories = await listCategories()
    let posts = []
    try {
        posts = await getBlogPosts("en-US")
    } catch (e) {
        console.error("Sitemap: 获取博客失败", e)
    }

    // --- 构建 URL 集合 ---

    const routes = ["", "/blog", "/about", "/contact"].map((route) => ({
        url: `${baseUrl}/${mainCountry}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === "" ? 1 : 0.8,
    }))

    const productEntries = allProducts.map((product) => ({
        url: `${baseUrl}/${mainCountry}/products/${product.handle}`,
        lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }))

    const categoryEntries = categories.map((category) => ({
        url: `${baseUrl}/${mainCountry}/categories/${category.handle}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }))

    const blogEntries = posts.map((post: any) => ({
        url: `${baseUrl}/${mainCountry}/blog/${post.slug}`,
        lastModified: post.publishedAt ? new Date(post.publishedAt) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.5,
    }))

    return [...routes, ...productEntries, ...categoryEntries, ...blogEntries]
}