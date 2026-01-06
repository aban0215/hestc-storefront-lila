const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL

/**
 * 获取全局 SEO 配置
 * 因为 SEO 字段你关闭了国际化，所以这里直接请求，不需要带 locale 参数
 */
export async function getGlobalSeoSetting() {
    try {
        const res = await fetch(`${STRAPI_URL}/api/lila-global-seo-setting?populate=*`, {
            next: { revalidate: 3600 }, // 缓存 1 小时
        });
        const { data } = await res.json();

        return {
            siteName: data?.siteName,
            favicon: data?.favicon?.[0]?.url, // 取第一张图标
            defaultSeo: data?.defaultSeo?.[0], // 取第一个 SEO 对象
        };
    } catch (error) {
        console.error("Failed to fetch Global SEO:", error);
        return null;
    }
}



/**
 * 获取具体页面的 SEO 补丁 (适用于商品、首页等)
 * @param handle 识别码
 * @param type 接口类型 (seo-extensions 或你的商品接口)
 */
export async function getPageSeo(handle: string, type: string) {
    // 关键：强制 locale=en，确保谷歌抓取的内容唯一
    const url = `${STRAPI_URL}/api/${type}?filters[handle][$eq]=${handle}&locale=en&populate=seo`;

    const res = await fetch(url);
    const { data } = await res.json();

    // 假设返回的是数组，取第一条的 seo 组件
    return data?.[0]?.seo;
}