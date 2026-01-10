
export type FacetSnapshot = {
    id: string
    materials: string[]
    collections: string[]
    dynamic_options: {
        title: string
        values: string[]
    }[]
    updated_at: string
}

/**
 * 从 MeiliSearch 获取指定分类或系列的属性快照
 */
export async function getFacetSnapshot(id: string): Promise<FacetSnapshot | null> {
    const host = process.env.NEXT_PUBLIC_MEILISEARCH_HOST
    const apiKey = process.env.NEXT_PUBLIC_MEILISEARCH_API_KEY

    if (!host || !apiKey) {
        console.warn("MeiliSearch 环境变量未配置")
        return null
    }

    try {
        // 直接根据 Document ID 获取单条数据，这是 MeiliSearch 最快的查询方式
        const response = await fetch(`${host}/indexes/product_facets/documents/${id}`, {
            headers: {
                Authorization: `Bearer ${apiKey}`,
            },
            // Medusa 建议：在开发环境下可以不缓存，生产环境下建议缓存 1 小时
            next: {
                revalidate: process.env.NODE_ENV === "development" ? 0 : 3600,
                tags: ["facets"]
            },
        })

        if (!response.ok) {
            // 如果没找到快照（比如该分类还没同步），静默失败
            return null
        }

        return await response.json()
    } catch (error) {
        console.error(`[MeiliSearch] 获取快照失败: ${id}`, error)
        return null
    }
}