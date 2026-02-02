import { MetadataRoute } from 'next'
import { listCategories } from "@lib/data/categories"
import { getBlogPosts } from "@lib/strapi/blog-data"
import { getBaseURL } from "@lib/util/env"
import { sdk } from "@lib/config"
import { getRegion } from "@lib/data/regions"

export const revalidate = 0
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = getBaseURL()
    const mainCountry = "us"

    let allProducts: any[] = []

    try {
        // 1. 获取 Region
        const region = await getRegion(mainCountry)

        // 2. 最简单的 SDK 调用，先不搞 while 循环，直接暴力拿 500 个看有没有
        // 绝大多数 Medusa 默认配置最多支持 limit=500
        const res = await sdk.client.fetch<{ products: any[] }>(
            `/store/products`,
            {
                method: "GET",
                query: {
                    limit: 500,
                    region_id: region?.id
                },
                cache: "no-store",
            }
        )

        allProducts = res.products || []
        console.log(">>> Sitemap Check: Found products count:", allProducts.length)
    } catch (error) {
        console.error("Sitemap Products Fetch Error:", error)
    }

    const categories = await listCategories()
    let posts = []
    try { posts = await getBlogPosts("en-US") } catch (e) {}

    // 静态页面
    const routes = ["", "/blog", "/about", "/contact"].map((route) => ({
        url: `${baseUrl}/${mainCountry}${route}`,
        lastModified: new Date(),
    }))

    // 商品页面
    const productEntries = allProducts.map((p) => ({
        url: `${baseUrl}/${mainCountry}/products/${p.handle}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
        priority: 0.7,
    }))

    // 分类页面
    const categoryEntries = categories.map((c) => ({
        url: `${baseUrl}/${mainCountry}/categories/${c.handle}`,
        lastModified: new Date(),
        priority: 0.6,
    }))

    // 博客页面
    const blogEntries = posts.map((post: any) => ({
        url: `${baseUrl}/${mainCountry}/blog/${post.slug}`,
        lastModified: post.publishedAt ? new Date(post.publishedAt) : new Date(),
        priority: 0.5,
    }))

    return [...routes, ...productEntries, ...categoryEntries, ...blogEntries]
}