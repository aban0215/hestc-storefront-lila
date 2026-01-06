const STRAPI_BASE_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL

export interface BlogModuleSettings {
    id: number
    moduleTitle: string
    moduleDescription?: string
    showModule: boolean
    readButtonText: string
    viewAllButtonText: string
    tagsLabel: string
    readTimeLabel: string
    authorLabel: string
    publishedLabel: string
    showReadTime: boolean
    showAuthor: boolean
    showCategory: boolean
    showTags: boolean
    showPublishDate: boolean
    createdAt: string
    updatedAt: string
    publishedAt: string
    locale: string
}

export interface BlogPostDetailData {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    author?: string;
    readTime: number;
    publishedAt: string;
    linkType: string;
    medusaHandle: string;
    coverImage: {
        url: string;
        mime?: string;
        alternativeText: string;
    };
    category?: {
        id: number;
        name: string;
        slug: string;
    };
    // 新增 SEO 字段映射
    blogSeo?: {
        metaTitle?: string;
        metaDescription?: string;
        keywords?: string;
        shareImage?: string;
    };
}

// 获取博客模块配置
export async function getBlogModuleSettings(locale: string): Promise<BlogModuleSettings | undefined> {
    try {
        const res = await fetch(
            `${STRAPI_BASE_URL}/api/lila-blog-module-setting?populate=*&locale=${locale}`,
            { next: { revalidate: 3600 } }
        )

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
        const data = await res.json()
        if (!data.data) return undefined

        return {
            id: data.data.id,
            moduleTitle: data.data.moduleTitle,
            moduleDescription: data.data.moduleDescription,
            showModule: data.data.showModule ?? true,
            readButtonText: data.data.readButtonText || 'Read Full Article',
            viewAllButtonText: data.data.viewAllButtonText || 'View All Articles',
            tagsLabel: data.data.tagsLabel || 'Tags:',
            readTimeLabel: data.data.readTimeLabel || 'min read',
            authorLabel: data.data.authorLabel || 'By',
            publishedLabel: data.data.publishedLabel || 'Published on',
            showReadTime: data.data.showReadTime ?? true,
            showAuthor: data.data.showAuthor ?? true,
            showCategory: data.data.showCategory ?? true,
            showTags: data.data.showTags ?? true,
            showPublishDate: data.data.showPublishDate ?? true,
            createdAt: data.data.createdAt,
            updatedAt: data.data.updatedAt,
            publishedAt: data.data.publishedAt,
            locale: data.data.locale || locale
        }
    } catch (error) {
        console.error('获取博客模块配置失败:', error)
    }
}

// 根据 slug 获取博客详情 (含 SEO 增强)
export async function getBlogPostBySlug(slug: string, locale: string): Promise<BlogPostDetailData | null> {
    try {
        // 调整后的 populate 逻辑：针对 blogSeo 组件及 shareImage 进行深度下钻
        const populateQuery = "populate[coverImage]=true&populate[lila_blog_category]=true&populate[blogSeo][populate]=shareImage"
        const url = `${STRAPI_BASE_URL}/api/lila-blog-posts?filters[slug][$eq]=${slug}&${populateQuery}&locale=${locale}`
        console.log('**********' + url)
        const res = await fetch(url, { next: { revalidate: 3600 } })
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)

        const response = await res.json()
        const data = response.data?.[0]
        if (!data) return null

        return {
            id: data.id,
            title: data.title,
            slug: data.slug,
            excerpt: data.excerpt,
            content: data.content,
            author: data.author,
            readTime: data.readTime,
            publishedAt: data.publishedAt,
            linkType: data.link_type || 'blog',
            medusaHandle: data.medusa_handle || data.slug.replace(/^\//, ''),
            coverImage: {
                url: data.coverImage?.url,
                mime: data.coverImage?.mime,
                alternativeText: data.coverImage?.alternativeText || data.title
            },
            category: data.category ? {
                id: data.category.id,
                name: data.category.name,
                slug: data.category.slug
            } : undefined,
            // 映射 SEO 组件数据
            blogSeo: data.blogSeo?.[0] ? {
                metaTitle: data.blogSeo[0].metaTitle,
                metaDescription: data.blogSeo[0].metaDescription,
                keywords: data.blogSeo[0].keywords,
                shareImage: data.blogSeo[0].shareImage?.[0]?.url
            } : undefined
        }
    } catch (error) {
        console.error(`获取博客详情失败 [slug: ${slug}]:`, error)
        return null
    }
}

// 获取博客分类列表
export async function getBlogCategories(locale: string) {
    const res = await fetch(
        `${STRAPI_BASE_URL}/api/lila-blog-categories?locale=${locale}&sort=order:asc`,
        { next: { revalidate: 3600 } }
    )
    const { data } = await res.json()
    return data || []
}

// 获取博客文章列表
export async function getBlogPosts(locale: string, categorySlug?: string) {
    let url = `${STRAPI_BASE_URL}/api/lila-blog-posts?populate=*&locale=${locale}&sort=createdAt:desc`

    if (categorySlug) {
        url += `&filters[lila_blog_category][slug][$eq]=${categorySlug}`
    }

    const res = await fetch(url, { next: { revalidate: 3600 } })
    const response = await res.json()

    return response.data.map((post: any) => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        readTime: post.readTime,
        publishedAt: post.publishedAt,
        coverImage: {
            mime: post.coverImage?.mime,
            url: post.coverImage?.url,
            alternativeText: post.coverImage?.alternativeText
        },
        category: post.lila_blog_category ? {
            name: post.lila_blog_category.name,
            slug: post.lila_blog_category.slug
        } : null
    }))
}

// 导出相关辅助函数
export {
    getLatestBlogPost,
    getFeaturedBlogPosts
} from './home-data'