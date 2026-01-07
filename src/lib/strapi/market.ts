const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL

/**
 * 根据 slug 获取营销数据
 * @param slug 传入的唯一标识，例如 "home_collection"
 * @param locale 语言代码
 */
export async function getMarketingBySlug(slug: string, locale: string = "en-US") {
    try {
        // 使用 Strapi 的 filters 参数进行精确匹配
        const query = new URLSearchParams({
            "filters[slug][$eq]": slug,
            "locale": locale,
            "populate": "*",
        });

        const response = await fetch(`${STRAPI_URL}/api/lila-collection-marketings?${query.toString()}`, {
            next: { revalidate: 3600 }, // 可选：设置缓存时间（1小时）
        });

        if (!response.ok) {
            throw new Error("Failed to fetch marketing data");
        }

        const { data } = await response.json();

        // 返回匹配的第一项数据，如果没有则返回 null
        return data && data.length > 0 ? data[0] : null;
    } catch (error) {
        console.error("Strapi Error:", error);
        return null;
    }
}