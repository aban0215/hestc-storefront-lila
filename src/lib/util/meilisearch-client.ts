import { Meilisearch } from "meilisearch"

const client = new Meilisearch({
    host: process.env.NEXT_PUBLIC_MEILISEARCH_HOST,
    apiKey: process.env.NEXT_PUBLIC_MEILISEARCH_API_KEY,
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

    const filterArray: string[] = []

    if (categoryId) filterArray.push(`category_ids = "${categoryId}"`)
    if (collectionId) filterArray.push(`collection_id = "${collectionId}"`)
    if (material) filterArray.push(`materials = "${material}"`)
    if (size) filterArray.push(`sizes = "${size}"`)
    if (color) filterArray.push(`colors = "${color}"`)

    const results = await index.search("", {
        filter: filterArray.join(" AND "),
        facets: ["materials", "sizes", "colors"],
        hitsPerPage: limit,
        page: page,
    })

    return {
        products: results.hits,
        count: results.totalHits,
        totalPages: results.totalPages,
        facetDistribution: results.facetDistribution
    }
}