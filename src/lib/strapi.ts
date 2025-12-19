import { strapi } from '@strapi/client';

/**
 * Strapi 客户端单例配置
 */
export const strapiClient = strapi({
    baseURL: `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api`,
    auth: process.env.STRAPI_API_TOKEN, // 自动从环境变量读取 Token
});

/**
 * 通用的 Strapi 请求封装
 * @param lang 当前语言代码 (如 'en', 'zh-CN')
 * @param optionsStrapi 请求配置
 */
export async function getStrapiData(
    contentType: string,
    lang: string = 'en',
    params: Record<string, any> = {}
) {
    try {
        // 合并默认参数：多语言过滤 + 自动填充关联字段
        const queryParams = {
            locale: lang,
            populate: '*', // 默认获取一层关联，如图片和动态组件
            ...params,
        };

        const response = await strapiClient.collection(contentType).find(queryParams);

        // Strapi 5 返回的数据通常在 data 字段中
        return response.data;
    } catch (error) {
        console.error(`[Strapi Error] Fetching ${contentType} failed:`, error);
        return null;
    }
}

/**
 * 针对 Single Type (如首页、全局配置) 的封装
 */
export async function getStrapiSingle(contentType: string, lang: string = 'en') {
    try {
        const response = await strapiClient.single(contentType).get({
            locale: lang,
            populate: 'deep', // 如果安装了 strapi-plugin-populate-deep，这里非常管用
        });
        return response.data;
    } catch (error) {
        console.error(`[Strapi Error] Fetching single ${contentType} failed:`, error);
        return null;
    }
}