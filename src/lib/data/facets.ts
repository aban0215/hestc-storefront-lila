
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
    // 既然搜索框能用，我们就用搜索框那个域名，但我们要确保 Header 绝对发出去
    const host = "https://search.hestc-me.site"
    const apiKey = process.env.NEXT_PUBLIC_MEILISEARCH_API_KEY

    try {
        const response = await fetch(`${host}/indexes/product_facets/documents/${id}`, {
            method: "GET",
            // 这里的 headers 结构一定要极其标准
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            // 强制不缓存，确保每次都是新鲜请求
            cache: 'no-store'
        })

        if (!response.ok) {
            // 打印详细的错误，帮我们定位是 401 (Key错) 还是 404 (没数据)
            const errorDetail = await response.text()
            console.log(`[Meilisearch 响应错误] 状态: ${response.status}, 内容: ${errorDetail}`)
            return null
        }

        const data = await response.json()
        return data
    } catch (error) {
        // 如果是网络不通，会进到这里
        console.error("[Meilisearch 网络异常]", error)
        return null
    }
}