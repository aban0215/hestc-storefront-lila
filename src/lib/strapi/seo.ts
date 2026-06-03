const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL

function prefixUrl(url: string | undefined): string {
    if (!url) return ''
    if (url.startsWith('http://')) return url.replace('http://', 'https://')
    if (url.startsWith('https://')) return url
    return `${STRAPI_URL}${url}`
}

/**
 * 获取全局 SEO 配置
 * 因为 SEO 字段你关闭了国际化，所以这里直接请求，不需要带 locale 参数
 */
export async function getGlobalSeoSetting() {
    try {
        const res = await fetch(`${STRAPI_URL}/api/lila-global-seo-setting?populate=*&locale=en-US`, {
            next: { revalidate: 3600 }, // 缓存 1 小时
        });
        const { data } = await res.json();

        return {
            siteName: data?.siteName,
            favicon: prefixUrl(data?.favicon?.[0]?.url), // 取第一张图标
            defaultSeo: data?.defaultSeo,
        };
    } catch (error) {
        console.error("Failed to fetch Global SEO:", error);
        return null;
    }
}

/**
 * 获取路由级 SEO 扩展（lila-seo-extensions）
 * 根据 handle 匹配：home / blog-key / {category-handle} 等
 * 返回 seo 组件数据，未匹配到返回 null
 */
export async function getSeoExtension(handle: string, locale: string = 'en-US') {
    const url = `${STRAPI_URL}/api/lila-seo-extensions?filters[handle][$eq]=${handle}&locale=${locale}&populate[seo][populate]=shareImage`
    try {
        const res = await fetch(url, { next: { revalidate: 3600 } })
        const { data } = await res.json()
        const s = data?.[0]?.seo
        if (!s || !s.metaTitle) return null
        return {
            metaTitle: s.metaTitle,
            metaDescription: s.metaDescription,
            keywords: s.keywords,
            shareImage: s.shareImage,
        }
    } catch (e) {
        console.error(`Failed to fetch SEO extension for "${handle}":`, e)
        return null
    }
}