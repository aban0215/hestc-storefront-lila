export async function getAnnouncements() {

    const STRAPI_BASE_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL

    // Strapi v5 的 API 路径
    // 过滤只显示激活的条目
    const res = await fetch(`${STRAPI_BASE_URL}/api/announcements?filters[is_active][$eq]=true`, {
        next: { revalidate: 3600 }, // 每小时更新一次缓存 (ISR)
    });

    if (!res.ok) return [];

    const { data } = await res.json();
    return data; // Strapi v5 直接返回数组，不再有 attributes 层级
}