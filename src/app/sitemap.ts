import { MetadataRoute } from 'next'
import { listProducts } from "@lib/data/products"
import { listCategories } from "@lib/data/categories"
import { getBlogPosts } from "@lib/strapi/blog-data"
import { getBaseURL } from "@lib/util/env"

export const revalidate = 0

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = getBaseURL()
    const mainCountry = "us"

    let allProducts: any[] = []
    let hasMore = true
    let offset = 0
    const BATCH_SIZE = 100 // 每次抓 100 个

    while (hasMore) {
        const { response: { products, count } } = await listProducts({
            countryCode: mainCountry,
            queryParams: {
                limit: BATCH_SIZE,
                offset: offset
            }
        })

        allProducts = [...allProducts, ...products]
        offset += BATCH_SIZE

        if (allProducts.length >= count || products.length === 0) {
            hasMore = false
        }
    }

    const categories = await listCategories()

    let posts = []
    try {
        posts = await getBlogPosts("en-US")
    } catch (e) {
        console.error("Sitemap: 获取博客失败", e)
    }

    const routes = ["", "/blog", "/about", "/contact"].map((route) => ({
        url: `${baseUrl}/${mainCountry}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === "" ? 1 : 0.8,
    }))

    const productEntries = allProducts.map((product) => ({
        url: `${baseUrl}/${mainCountry}/products/${product.handle}`,
        lastModified: new Date(product.updated_at),
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
        lastModified: new Date(post.publishedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.5,
    }))

    return [...routes, ...productEntries, ...categoryEntries, ...blogEntries]
}