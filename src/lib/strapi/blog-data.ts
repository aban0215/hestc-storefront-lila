const STRAPI_BASE_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://47.89.151.64:1337'

export interface BlogModuleSettings {
    id: number
    // 模块信息
    moduleTitle: string
    moduleDescription?: string
    showModule: boolean

    // 按钮文本
    readButtonText: string
    viewAllButtonText: string

    // 标签文本
    tagsLabel: string
    readTimeLabel: string
    authorLabel: string
    publishedLabel: string

    // 显示控制
    showReadTime: boolean
    showAuthor: boolean
    showCategory: boolean
    showTags: boolean
    showPublishDate: boolean

    // 系统字段
    createdAt: string
    updatedAt: string
    publishedAt: string
    locale: string
}


// 获取博客模块配置
export async function getBlogModuleSettings(locale: string): Promise<BlogModuleSettings> {
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
                console.log('博客模块配置接口未找到，使用默认配置')
            }
            throw new Error(`HTTP error! status: ${res.status}`)
        }

        const data = await res.json()

        if (!data.data) {
            console.log('博客模块配置接口未找到，使用默认配置')
        }

        return {
            id: data.data.id,
            moduleTitle: data.data.moduleTitle,
            moduleDescription: data.data.moduleDescription,
            showModule: data.data.showModule ?? true,

            // 按钮文本
            readButtonText: data.data.readButtonText || 'Read Full Article',
            viewAllButtonText: data.data.viewAllButtonText || 'View All Articles',

            // 标签文本
            tagsLabel: data.data.tagsLabel || 'Tags:',
            readTimeLabel: data.data.readTimeLabel || 'min read',
            authorLabel: data.data.authorLabel || 'By',
            publishedLabel: data.data.publishedLabel || 'Published on',

            // 显示控制
            showReadTime: data.data.showReadTime ?? true,
            showAuthor: data.data.showAuthor ?? true,
            showCategory: data.data.showCategory ?? true,
            showTags: data.data.showTags ?? true,
            showPublishDate: data.data.showPublishDate ?? true,

            // 系统字段
            createdAt: data.data.createdAt,
            updatedAt: data.data.updatedAt,
            publishedAt: data.data.publishedAt,
            locale: data.data.locale || locale
        }
    } catch (error) {
        console.error('获取博客模块配置失败:', error)
    }
}


// 导出已有的博客相关函数
export {
    getLatestBlogPost,
    getFeaturedBlogPosts,
    BlogPostData,
    BlogCategory
} from './home-data'