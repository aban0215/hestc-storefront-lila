import { getLocale } from "@lib/data/locale-actions"

export interface StrapiFAQItem {
    id: number
    question: string
    answer: string
}

export interface StrapiImage {
    id: number
    url: string
    alternativeText: string | null
    width: number
    height: number
    formats?: {
        small?: { url: string }
        medium?: { url: string }
        large?: { url: string }
        thumbnail?: { url: string }
    }
}

export interface LilaProductContent {
    id: number
    documentId: string
    medusa_handle: string
    story_title: string
    story_content: string
    video_url: string | null
    care_instructions: string | null
    locale: string
    size_guide: StrapiImage | null
    lilafaqitem: StrapiFAQItem[]
}

export interface StrapiProductResponse {
    data: LilaProductContent[]
    meta: {
        pagination: {
            page: number
            pageSize: number
            pageCount: number
            total: number
        }
    }
}



/**
 * 根据 Medusa 的 handle 获取 Strapi 中的增强内容
 */
export async function getProductStrapiContent(handle: string): Promise<LilaProductContent | null> {
    const locale = await getLocale()
    const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://47.89.151.64:1337"
    try {
        const response = await fetch(
            `${strapiUrl}/api/lila-product-contents?filters[medusa_handle][$eq]=${handle}&locale=${locale}&populate=*`,
            {
                // 建议设置缓存时间，或者根据需要使用 no-store
                next: { revalidate: 3600 },
            }
        )
        if (!response.ok) {
            throw new Error(`Strapi error: ${response.statusText}`)
        }
        const { data }: StrapiProductResponse = await response.json()
        // 返回匹配 handle 的第一条数据
        return data && data.length > 0 ? data[0] : null
    } catch (error) {
        console.error("Fetch Strapi Product Content Error:", error)
        return null
    }
}




/**
 * 获取商品 SEO 补丁
 * 强制使用 locale=en-US 以实现单中心索引
 */
export async function getProductSeo(handle: string) {
    const STRAPI_URL = "http://47.89.151.64:1337";
    const query = `${STRAPI_URL}/api/lila-product-contents?filters[medusa_handle][$eq]=${handle}&locale=en-US&populate[productSeo][populate]=shareImage`;

    try {
        const res = await fetch(query, { next: { revalidate: 3600 } });
        const { data } = await res.json();

        // 返回第一个匹配商品的第一个 SEO 对象
        return data?.[0]?.productSeo?.[0] || null;
    } catch (error) {
        console.error("Failed to fetch product SEO:", error);
        return null;
    }
}