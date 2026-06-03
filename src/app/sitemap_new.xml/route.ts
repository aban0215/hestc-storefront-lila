import { listCategories } from "@lib/data/categories"
import { getBlogPosts } from "@lib/strapi/blog-data"
import { getBaseURL } from "@lib/util/env"
import { sdk } from "@lib/config"
import { getRegion } from "@lib/data/regions"
import { NextResponse } from "next/server"

export const revalidate = 3600

export async function GET() {
    const baseUrl = getBaseURL().replace(/\/$/, '')
    const mainCountry = "us"

    let allProducts: any[] = []
    try {
        const region = await getRegion(mainCountry)
        const res = await sdk.client.fetch<{ products: any[] }>(
            `/store/products`,
            {
                method: "GET",
                query: { limit: 500, region_id: region?.id, fields: "handle" },
                next: { revalidate: 3600 }
            }
        )
        allProducts = res.products || []
    } catch (error) {
        console.error("Sitemap Fetch Error:", error)
    }

    const categories = await listCategories()
    let posts = []
    try { posts = await getBlogPosts("en-US") } catch (e) {}

    // --- 只包含核心业务链接 ---
    const allRoutes = [
        // 首页还是建议保留，它是站点的权重中心
        { url: `${baseUrl}/${mainCountry}`, prio: 1.0 },

        // 商品页面 - 你的核心需求
        ...allProducts.map(p => ({
            url: `${baseUrl}/${mainCountry}/products/${p.handle}`,
            prio: 0.9
        })),

        // 分类页面 - 辅助权重
        ...categories.map(c => ({
            url: `${baseUrl}/${mainCountry}/categories/${c.handle}`,
            prio: 0.7
        })),

    ]

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${allRoutes.map(item => `
        <url>
          <loc>${item.url}</loc>
          <lastmod>${new Date().toISOString()}</lastmod>
          <priority>${item.prio}</priority>
        </url>
      `).join('')}
    </urlset>`

    return new NextResponse(sitemapXml, {
        headers: { "Content-Type": "application/xml" },
    })
}