import { Meilisearch } from "meilisearch"

const client = new Meilisearch({
    host: process.env.NEXT_PUBLIC_MEILISEARCH_HOST || "http://127.0.0.1:7700",
    apiKey: process.env.NEXT_PUBLIC_MEILISEARCH_API_KEY, // 确保用的是 Search Key
})

export const searchProducts = async ({
                                         categoryId,
                                         collectionId,
                                         material,
                                         size,
                                         color,
                                         page = 1,
                                         limit = 12,
                                     }) => {
    const index = client.index("products")

    // 构建 Meilisearch 语法的 Filter 字符串
    const filters: string[] = []
    if (categoryId) filters.push(`category_ids = "${categoryId}"`)
    if (collectionId) filters.push(`collection_id = "${collectionId}"`)
    if (material) filters.push(`materials = "${material}"`)
    if (size) filters.push(`sizes = "${size}"`)
    if (color) filters.push(`colors = "${color}"`)

    const results = await index.search("", {
        filter: filters.join(" AND "),
        facets: ["materials", "sizes", "colors"], // 获取聚合数据供菜单显示
        hitsPerPage: limit,
        page: page,
    })

    return {
        products: results.hits,
        count: results.totalHits,
        facetDistribution: results.facetDistribution, // 这里的格式非常适合做筛选菜单
        totalPages: results.totalPages
    }
}