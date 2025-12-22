import { getLatestBlogPost, BlogPostData } from '../../../lib/strapi/blog-data'
import { getBlogModuleSettings } from '../../../lib/strapi/blog-data'
import { getSelectedLocale } from '@lib/data/locales'
import LocalizedClientLink from '@modules/common/components/localized-client-link'

export default async function BlogShowcase() {
    const localecode = (await getSelectedLocale()) || 'en-US'

    // 并行获取配置和博客文章
    const [settings, blogPost] = await Promise.all([
        getBlogModuleSettings(localecode),
        getLatestBlogPost(localecode)
    ])

    // 如果配置中不显示博客模块，或者没有博客文章，则不显示
    if (!settings.showModule || !blogPost) {
        return null
    }

    // 构建图片URL
    const imageUrl = blogPost.coverImage.url
        ? `${process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://47.89.151.64:1337'}${blogPost.coverImage.url}`
        : null

    return (
        <section className="py-16 md:py-20 bg-gray-50">
            <div className="container mx-auto px-4">
                {/* 标题区域 - 完全动态 */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
                        {settings.moduleTitle}
                    </h2>
                    {settings.moduleDescription && (
                        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                            "{settings.moduleDescription}"
                        </p>
                    )}
                </div>

                {/* 博客卡片 */}
                <div className="max-w-6xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                            {/* 图片区域 */}
                            <div className="lg:col-span-1 relative h-64 lg:h-auto">
                                {imageUrl && (
                                    <img
                                        src={imageUrl}
                                        alt={blogPost.coverImage.alternativeText || blogPost.title}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                )}
                                {/* 分类标签 - 根据配置显示 */}
                                {settings.showCategory && blogPost.category && (
                                    <div className="absolute top-4 left-4">
                    <span className="inline-block px-3 py-1 bg-pink-600 text-white text-xs font-semibold rounded-full">
                      {blogPost.category.name}
                    </span>
                                    </div>
                                )}
                            </div>

                            {/* 内容区域 */}
                            <div className="lg:col-span-2 p-8 lg:p-10 flex flex-col">
                                {/* 元信息 - 完全动态 */}
                                <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-500">
                                    {settings.showAuthor && blogPost.author && (
                                        <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                                            {settings.authorLabel} {blogPost.author}
                    </span>
                                    )}

                                    {settings.showReadTime && blogPost.readTime && (
                                        <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                                            {blogPost.readTime} {settings.readTimeLabel}
                    </span>
                                    )}

                                    {settings.showPublishDate && blogPost.publishedAt && (
                                        <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                                            {settings.publishedLabel} {formatDate(blogPost.publishedAt, localecode)}
                    </span>
                                    )}
                                </div>

                                {/* 标题 */}
                                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 line-clamp-2">
                                    {blogPost.title}
                                </h3>

                                {/* 摘要 */}
                                <p className="text-gray-600 mb-6 flex-grow line-clamp-3">
                                    {blogPost.excerpt}
                                </p>

                                {/* 底部区域 */}
                                <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                                    {/* 标签区域 - 根据配置显示 */}
                                    {settings.showTags && blogPost.category && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-500">{settings.tagsLabel}</span>
                                            <span className="text-sm text-pink-600 font-medium">
                        #{blogPost.category.name}
                      </span>
                                        </div>
                                    )}

                                    {/* 阅读按钮 - 完全动态 */}
                                    <LocalizedClientLink
                                        href={`/blog/${blogPost.slug}`}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-pink-600 text-white font-medium rounded-lg hover:bg-pink-700 transition-colors group"
                                    >
                                        {settings.readButtonText}
                                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </LocalizedClientLink>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* "查看全部博客"链接 - 完全动态 */}
                    <div className="text-center mt-10">
                        <LocalizedClientLink
                            href="/blog"
                            className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 font-medium text-lg group"
                        >
                            {settings.viewAllButtonText}
                            <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </LocalizedClientLink>
                    </div>
                </div>
            </div>
        </section>
    )
}

// 日期格式化辅助函数
function formatDate(dateString: string, locale: string): string {
    const date = new Date(dateString)

    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }

    // 根据locale选择格式
    if (locale === 'zh-CN' || locale.includes('zh')) {
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    return date.toLocaleDateString(locale, options)
}