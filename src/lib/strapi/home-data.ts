const STRAPI_BASE_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://47.89.151.64:1337'

export interface StrapiImage {
    id: number
    url: string
    alternativeText?: string
    formats?: {
        thumbnail?: { url: string }
        small?: { url: string }
        medium?: { url: string }
        large?: { url: string }
    }
}

export interface HomeHeroData {
    id: number
    title: string
    subtitle?: string
    buttonText: string
    buttonLink: string
    link_type: 'category' | 'collection' | 'product' | 'external'
    medusa_handle: string
    active: boolean
    overlayOpacity?: number
    backgroundImage: StrapiImage
}

// 获取Hero数据
export async function getHomeHero(locale: string): Promise<HomeHeroData | null> {
    try {
        const res = await fetch(
            `${STRAPI_BASE_URL}/api/lila-home-hero?populate=*&locale=${locale}`,
            {
                next: { revalidate: 3600 }
            }
        )

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)

        const response = await res.json()
        const data = response.data

        if (!data || !data.active) return null

        return {
            id: data.id,
            title: data.title,
            subtitle: data.subtitle,
            buttonText: data.buttonText,
            linkType: data.link_type,
            medusaHandle: data.medusa_handle,
            active: data.active,
            overlayOpacity: data.overlayOpacity,
            backgroundImage: {
                id: data.backgroundImage?.id,
                url: data.backgroundImage?.url,
                alternativeText: data.backgroundImage?.alternativeText,
                formats: data.backgroundImage?.formats
            }
        }
    } catch (error) {
        console.error('获取Hero数据失败:', error)
        return null
    }
}

//获取分类数据
export interface HomeCategorySectionData {
    id: number
    title: string
    subtitle: string
    featuredCategories: {
        id: number
        name: string
        slug: string
        description: string
        buttonText: string
        buttonLink: string
        link_type: 'category' | 'collection' | 'product' | 'external'
        medusa_handle: string
        order: number
        featured: boolean
        image: StrapiImage  // 现在包含图片数据了
    }[]
}

// 更新getHomeCategorySection函数
export async function getHomeCategorySection(locale: string): Promise<HomeCategorySectionData | null> {
    try {
        const res = await fetch(
            `${STRAPI_BASE_URL}/api/lila-home-category-section?populate[featuredCategories][populate]=image&locale=${locale}`,
            {
                next: { revalidate: 3600 }
            }
        )

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`)
        }

        const data = await res.json()

        if (!data.data) {
            return null
        }

        // 处理featuredCategories，确保按order排序
        const featuredCategories = data.data.featuredCategories
            ? data.data.featuredCategories.map((cat: any) => ({
                id: cat.id,
                name: cat.name,
                slug: cat.slug,
                description: cat.description,
                buttonText: cat.buttonText,
                buttonLink: cat.buttonLink,
                linkType: cat.link_type,
                medusaHandle: cat.medusa_handle,
                order: cat.order,
                featured: cat.featured,
                image: {
                    id: cat.image.id,
                    url: cat.image.url,
                    alternativeText: cat.image.alternativeText,
                    formats: cat.image.formats
                }
            })).sort((a: any, b: any) => a.order - b.order)
            : []

        return {
            id: data.data.id,
            title: data.data.title,
            subtitle: data.data.subtitle,
            featuredCategories
        }
    } catch (error) {
        console.error('获取品类展示区配置失败:', error)
        return null
    }
}


//添加New Arrival相关函数

export interface NewArrivalData {
    id: number
    title: string
    subtitle: string
    description: string
    buttonText: string
    buttonLink: string
    link_type: 'category' | 'collection' | 'product' | 'external'
    medusa_handle: string
    active: boolean
    backgroundImage: StrapiImage // 注意：API返回的是数组，但我们只取第一个
}

// 获取新品宣传数据
export async function getNewArrivalPromo(locale: string): Promise<NewArrivalData | null> {
    try {
        const res = await fetch(
            `${STRAPI_BASE_URL}/api/lila-home-new-arrival?populate=*&locale=${locale}`,
            {
                next: { revalidate: 3600 }
            }
        )

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`)
        }

        const data = await res.json()

        if (!data.data || !data.data.active) {
            return null
        }

        // 注意：backgroundImage是一个数组，我们取第一个
        const backgroundImage = Array.isArray(data.data.backgroundImage)
            ? data.data.backgroundImage[0]
            : data.data.backgroundImage

        if (!backgroundImage) {
            console.warn('New Arrival Promo没有背景图片')
            return null
        }

        return {
            id: data.data.id,
            title: data.data.title,
            subtitle: data.data.subtitle,
            description: data.data.description,
            buttonText: data.data.buttonText,
            buttonLink: data.data.buttonLink,
            linkType: data.data.link_type,
            medusaHandle: data.data.medusa_handle,
            active: data.data.active,
            backgroundImage: {
                id: backgroundImage.id,
                url: backgroundImage.url,
                alternativeText: backgroundImage.alternativeText,
                formats: backgroundImage.formats
            }
        }
    } catch (error) {
        console.error('获取新品宣传数据失败:', error)
        return null
    }
}



export interface BestSellerConfig {
    id: number
    title: string
    subtitle: string
    displayCount: number
    link_type: 'category' | 'collection' | 'product' | 'external'
    medusa_handle: string
    buttonText: string
    buttonLink: string
    products: {
        id: number
        sortOrder: number
        producthandle: string
    }[]
}

// Best Seller 配置数据获取
export async function getBestSellerConfig(locale: string): Promise<BestSellerConfig | null> {
    try {
        const res = await fetch(
            `${STRAPI_BASE_URL}/api/lila-home-best-seller?populate=*&locale=${locale}`,
            {
                next: { revalidate: 3600 }
            }
        )

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`)
        }

        const data = await res.json()

        if (!data.data) {
            return null
        }

        // 处理products数组，按sortOrder排序，限制displayCount数量
        const products = data.data.products
            ? data.data.products
                .map((p: any) => ({
                    id: p.id,
                    sortOrder: p.sortOrder || 0,
                    producthandle: p.producthandle
                }))
                .sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0))
                .slice(0, data.data.displayCount || 6) // 限制显示数量
            : []

        return {
            id: data.data.id,
            title: data.data.title,
            subtitle: data.data.subtitle,
            displayCount: data.data.displayCount || 6,
            buttonText: data.data.buttonText,
            buttonLink: data.data.buttonLink,
            linkType: data.data.link_type,
            medusaHandle: data.data.medusa_handle,
            products
        }
    } catch (error) {
        console.error('获取Best Seller配置失败:', error)
        return null
    }
}




// 博客文章类型
export interface BlogPostData {
    id: number
    documentId: string
    title: string
    slug: string
    excerpt: string
    content: string
    readTime: number
    author: string
    link_type: string
    featured: boolean
    createdAt: string
    updatedAt: string
    publishedAt: string
    locale: string
    coverImage: StrapiImage
    category: BlogCategory
    localizations: any[]
}

export interface BlogCategory {
    id: number
    documentId: string
    name: string
    slug: string
    description: string
    createdAt: string
    updatedAt: string
    publishedAt: string
    locale: string
}

// 博客列表响应类型
export interface BlogPostsResponse {
    data: BlogPostData[]
    meta: {
        pagination: {
            page: number
            pageSize: number
            pageCount: number
            total: number
        }
    }
}




// 在 getHomeHero 函数后面添加以下函数

// 获取最新的博客文章
export async function getLatestBlogPost(locale: string): Promise<BlogPostData | null> {
    try {
        // 按 publishedAt 降序排序，获取最新的一篇
        const res = await fetch(
            `${STRAPI_BASE_URL}/api/lila-blog-posts?populate=*&locale=${locale}&sort[0]=publishedAt:desc&pagination[pageSize]=1`,
            {
                next: { revalidate: 3600 } // 1小时缓存
            }
        )

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`)
        }

        const data: BlogPostsResponse = await res.json()

        if (!data.data || data.data.length === 0) {
            return null
        }

        return data.data[0]
    } catch (error) {
        console.error('获取博客文章失败:', error)
        return null
    }
}

// 获取多篇博客文章（可选，用于未来扩展）
export async function getFeaturedBlogPosts(locale: string, limit: number = 2): Promise<BlogPostData[]> {
    try {
        const res = await fetch(
            `${STRAPI_BASE_URL}/api/lila-blog-posts?populate=*&locale=${locale}&sort[0]=publishedAt:desc&pagination[pageSize]=${limit}`,
            {
                next: { revalidate: 3600 }
            }
        )

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`)
        }

        const data: BlogPostsResponse = await res.json()

        return data.data || []
    } catch (error) {
        console.error('获取精选博客文章失败:', error)
        return []
    }
}




export interface BlogModuleSettings {
    id: number
    moduleTitle: string
    moduleDescription?: string
    showModule: boolean
    postsPerPage: number
    showReadTime: boolean
    showAuthor: boolean
    showCategory: boolean
    createdAt: string
    updatedAt: string
    publishedAt: string
    locale: string
}

// 获取博客模块配置
export async function getBlogModuleSettings(locale: string): Promise<BlogModuleSettings | null> {
    try {
        const res = await fetch(
            `${STRAPI_BASE_URL}/api/lila-blog-module-setting?populate=*&locale=${locale}`,
            {
                next: { revalidate: 3600 }
            }
        )

        if (!res.ok) {
            // 如果接口不存在，返回默认配置
            if (res.status === 404) {
                return getDefaultBlogSettings()
            }
            throw new Error(`HTTP error! status: ${res.status}`)
        }

        const data = await res.json()

        if (!data.data) {
            return getDefaultBlogSettings()
        }

        return {
            id: data.data.id,
            moduleTitle: data.data.moduleTitle,
            moduleDescription: data.data.moduleDescription,
            showModule: data.data.showModule ?? true,
            postsPerPage: data.data.postsPerPage ?? 10,
            showReadTime: data.data.showReadTime ?? true,
            showAuthor: data.data.showAuthor ?? true,
            showCategory: data.data.showCategory ?? true,
            createdAt: data.data.createdAt,
            updatedAt: data.data.updatedAt,
            publishedAt: data.data.publishedAt,
            locale: data.data.locale
        }
    } catch (error) {
        console.error('获取博客模块配置失败:', error)
        return getDefaultBlogSettings()
    }
}

// 默认配置
function getDefaultBlogSettings(): BlogModuleSettings {
    return {
        id: 0,
        moduleTitle: "LILA ZEN 运动生活博客",
        moduleDescription: "分享瑜伽、运动、健康生活的点滴",
        showModule: true,
        postsPerPage: 10,
        showReadTime: true,
        showAuthor: true,
        showCategory: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
        locale: 'en-US'
    }
}







// --- 类型定义 ---

export interface StrapiImage {
    id: number;
    url: string;
    alternativeText?: string;
    formats?: any;
}

export interface ValueProp {
    id: number;
    title: string;
    description: string;
    icon_code: string;
}

export interface NavLink {
    id: number;
    label: string;
    url: string;
    is_external: boolean | null;
}

export interface NavColumn {
    id: number;
    title: string;
    links: NavLink[];
}

export interface LegalLink {
    id: number;
    label: string;
    url: string;
    is_external: boolean | null;
}

export interface FooterSettingData {
    id: number;
    documentId: string;
    newsletter_title: string;
    newsletter_description: string;
    newsletter_placeholder: string;
    newsletter_button: string;
    copyright_text: string;
    value_props: ValueProp[];
    nav_columns: NavColumn[];
    legal_links: LegalLink[];
    payment_icons: StrapiImage[];
}

/**
 * 获取 Footer 设置数据
 * @param locale 语言代码，如 'en-US' 或 'zh-CN'
 */
// export async function getFooterSetting(locale: string = 'en-US'): Promise<FooterSettingData | null> {
//     try {
//         // 构建深度查询参数，确保抓取嵌套的 nav_columns.links
//         // 这里使用 URLSearchParams 手动构建，避免依赖 qs 库
//         const queryParams = new URLSearchParams({
//             locale: locale,
//             'populate[value_props]': '*',
//             'populate[nav_columns][populate]': 'links',
//             'populate[legal_links]': '*',
//             'populate[payment_icons]': 'true' // Strapi 5 针对 Media 的安全填充
//         });
//
//         const url = `${STRAPI_BASE_URL}/api/lila-footer-setting?${queryParams.toString()}`;
//
//         const res = await fetch(url, {
//             // 设置缓存策略，Next.js App Router 模式
//             next: {
//                 revalidate: 3600, // 每小时更新一次
//                 tags: ['footer-setting']
//             }
//         });
//
//         if (!res.ok) {
//             throw new Error(`Strapi Fetch Error: ${res.status} ${res.statusText}`);
//         }
//
//         const { data } = await res.json();
//
//         if (!data) return null;
//
//         // 解析并转换数据，确保前端拿到的数据是干净且完整的
//         return {
//             id: data.id,
//             documentId: data.documentId,
//             newsletter_title: data.newsletter_title || "",
//             newsletter_description: data.newsletter_description || "",
//             newsletter_placeholder: data.newsletter_placeholder || "",
//             newsletter_button: data.newsletter_button || "",
//             copyright_text: data.copyright_text || "",
//
//             // 解析价值主张 (Component)
//             value_props: (data.value_props || []).map((v: any) => ({
//                 id: v.id,
//                 title: v.title,
//                 description: v.description,
//                 icon_code: v.icon_code
//             })),
//
//             // 解析导航列 (Repeatable Component 嵌套 Link Component)
//             nav_columns: (data.nav_columns || []).map((n: any) => ({
//                 id: n.id,
//                 title: n.title,
//                 links: (n.links || []).map((l: any) => ({
//                     id: l.id,
//                     label: l.label,
//                     url: l.url,
//                     is_external: l.is_external
//                 }))
//             })),
//
//             // 解析底部法律链接
//             legal_links: (data.legal_links || []).map((l: any) => ({
//                 id: l.id,
//                 label: l.label,
//                 url: l.url,
//                 is_external: l.is_external
//             })),
//
//             // 解析并补全图片 URL
//             payment_icons: (data.payment_icons || []).map((img: any) => ({
//                 id: img.id,
//                 url: img.url.startsWith('http') ? img.url : `${STRAPI_BASE_URL}${img.url}`,
//                 alternativeText: img.alternativeText || "payment method",
//                 formats: img.formats
//             }))
//         };
//     } catch (error) {
//         console.error('Failed to fetch footer settings from Strapi:', error);
//         return null;
//     }
// }




export async function getFooterSetting(locale: string) {
    try {
        const url = `${STRAPI_BASE_URL}/api/lila-footer?populate[footer][on][lila-footer-column.lila-footer-column][populate][lilalinks][populate][0]=page&locale=${locale}`


        const res = await fetch(url, {
            next: { revalidate: 3600 }
        });

        if (!res.ok) {
            console.error(`HTTP错误! 状态: ${res.status}`);
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        const json = await res.json();

        // 打印格式化后的JSON数据
        // console.log('Strapi响应数据:');
        // console.log(JSON.stringify(json, null, 2));

        return json.data;
    } catch (error) {
        console.error('获取底栏配置失败:', error);
        return null;
    }
}


export async function getLilaPageBySlug(slug: string, locale: string) {
    try {
        const url = `${STRAPI_BASE_URL}/api/lila-pages?filters[slug][$eq]=${slug}&locale=${locale}&populate=*`;

        const res = await fetch(url, {
            next: { revalidate: 3600 }
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const json = await res.json();

        // 返回数组中的第一条匹配项
        return json.data?.[0] || null;
    } catch (error) {
        console.error('获取页面内容失败:', error);
        return null;
    }
}