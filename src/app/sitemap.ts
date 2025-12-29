import { MetadataRoute } from 'next'
import { listProducts } from "@lib/data/products"
import { listCategories } from "@lib/data/categories"
import { getBlogPosts } from "@lib/strapi/blog-data"
import { getBaseURL } from "@lib/util/env"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = getBaseURL()
    const mainCountry = "us" // 遵循你的单中心索引策略，sitemap 只放主版本

    // 1. 获取所有商品数据
    const { response: { products } } = await listProducts({
        countryCode: mainCountry,
        queryParams: { limit: 100 }
    })

    // 2. 获取所有分类数据
    const categories = await listCategories()

    // 3. 获取 Strapi 博客数据 (强制英文)
    const posts = await getBlogPosts("en-US")

    // --- 开始构建静态页面 ---
    const routes = ["", "/blog", "/about", "/contact"].map((route) => ({
        url: `${baseUrl}/${mainCountry}${route}`,
        lastModified: new Date(),
        priority: route === "" ? 1 : 0.8,
    }))

    // --- 构建商品页面 ---
    const productEntries = products.map((product) => ({
        url: `${baseUrl}/${mainCountry}/products/${product.handle}`,
        lastModified: product.updated_at,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }))

    // --- 构建分类页面 ---
    const categoryEntries = categories.map((category) => ({
        url: `${baseUrl}/${mainCountry}/categories/${category.handle}`,
        lastModified: new Date(),
        priority: 0.6,
    }))

    // --- 构建博客页面 ---
    const blogEntries = posts.map((post) => ({
        url: `${baseUrl}/${mainCountry}/blog/${post.slug}`,
        lastModified: post.publishedAt,
        priority: 0.5,
    }))

    return [...routes, ...productEntries, ...categoryEntries, ...blogEntries]
}