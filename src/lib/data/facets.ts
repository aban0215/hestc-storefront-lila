
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
export async function getFacetSnapshot(id: string) {
    const host = process.env.NEXT_PUBLIC_MEILISEARCH_HOST
    const apiKey = process.env.NEXT_PUBLIC_MEILISEARCH_API_SUPER_KEY || process.env.NEXT_PUBLIC_MEILISEARCH_API_KEY

    if (!host || !apiKey) return null
    if (host.includes("127.0.0.1") || host.includes("localhost")) return null

    try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 8000)

        const response = await fetch(`${host}/indexes/product_facets/documents/${id}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            cache: 'force-cache',
            signal: controller.signal,
        })

        clearTimeout(timeout)

        if (!response.ok) {
            return null
        }

        const data = await response.json()
        return data
    } catch {
        return null
    }
}