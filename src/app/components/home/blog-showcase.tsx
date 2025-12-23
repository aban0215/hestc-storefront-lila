// app/components/home/blog-showcase.tsx
import { getLatestBlogPost, BlogPostData } from '../../../lib/strapi/blog-data'
import { getBlogModuleSettings } from '../../../lib/strapi/blog-data'
import { getSelectedLocale } from '@lib/data/locales'
import LocalizedClientLink from '@modules/common/components/localized-client-link'

export default async function BlogShowcase() {
    const localecode = (await getSelectedLocale()) || 'en-US'

    const [settings, blogPost] = await Promise.all([
        getBlogModuleSettings(localecode),
        getLatestBlogPost(localecode)
    ])

    if (!settings.showModule || !blogPost) {
        return null
    }

    const imageUrl = blogPost.coverImage.url
        ? `${process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://47.89.151.64:1337'}${blogPost.coverImage.url}`
        : null

    return (
        <section className="relative w-full overflow-hidden bg-white border-t border-gray-100">
            {/* 1. 模块标题区域 - 优化为非对称艺术风格 */}
            <div className="container mx-auto px-2 pt-4 pb-0">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-8">
                    <div className="relative">
                        <h2 className="text-2xl md:text-4xl font-serif font-bold text-gray-900 tracking-tight relative z-10">
                            {settings.moduleTitle}
                        </h2>
                        {/* 品牌色装饰点或短线 */}
                    </div>

                    {settings.moduleDescription && (
                        <div className="max-w-md md:text-right">
                            <p className="text-gray-400 text-xs md:text-sm font-light leading-relaxed tracking-wide italic">
                                "{settings.moduleDescription}"
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* 2. 沉浸式博客平铺区域 - 核心样式修改 */}
            <div className="group relative w-full h-[70vh] min-h-[500px] overflow-hidden">
                {/* 背景图片 */}
                <div className="absolute inset-0">
                    {imageUrl && (
                        <img
                            src={imageUrl}
                            alt={blogPost.coverImage.alternativeText || blogPost.title}
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                            loading="lazy"
                        />
                    )}
                    {/* 深色渐变遮罩 - 确保文字阅读清晰 */}
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-500" />
                </div>

                {/* 内容叠加层 */}
                <div className="relative h-full flex items-center justify-center text-center px-6">
                    <div className="max-w-3xl text-white">
                        {/* 元信息标签 */}
                        <div className="flex flex-wrap justify-center items-center gap-6 mb-6 text-xs md:text-sm tracking-[0.1em] text-gray-200">
                            {settings.showCategory && blogPost.category && (
                                <span className="px-3 py-1 border border-white/40 uppercase font-medium">
                    {blogPost.category.name}
                </span>
                            )}
                            {settings.showPublishDate && blogPost.publishedAt && (
                                <span>{formatDate(blogPost.publishedAt, localecode)}</span>
                            )}
                            {settings.showReadTime && blogPost.readTime && (
                                <span>{blogPost.readTime} {settings.readTimeLabel}</span>
                            )}
                        </div>

                        {/* 博客标题 */}
                        <h3 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold mb-6 leading-tight">
                            {blogPost.title}
                        </h3>

                        {/* 摘要 */}
                        <p className="text-gray-200 text-sm md:text-lg mb-10 max-w-2xl mx-auto opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-700 line-clamp-2 md:line-clamp-none">
                            {blogPost.excerpt}
                        </p>

                        {/* 按钮组合区域 */}
                        <div className="flex flex-col items-center gap-6">
                            {/* 主按钮 - 极简线性风格 */}
                            <LocalizedClientLink
                                href={`/blog/${blogPost.slug}`}
                                className="px-10 py-4 border border-white text-white text-xs font-bold tracking-[0.2em] hover:bg-white hover:text-black transition-all duration-300"
                            >
                                {settings.readButtonText?.toUpperCase() || 'READ MORE'}
                            </LocalizedClientLink>

                            {/* “查看全部”链接 - 移动到此处并调整颜色为白色以适应背景 */}
                            <LocalizedClientLink
                                href="/blog"
                                className="inline-flex items-center gap-2 text-white/80 font-bold text-xs tracking-[0.2em] uppercase hover:text-white transition-colors group/all"
                            >
                                <span>{settings.viewAllButtonText}</span>
                                <svg className="w-4 h-4 transition-transform group-hover/all:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </LocalizedClientLink>
                        </div>
                    </div>
                </div>

                {/* 全区域点击感应 */}
                <LocalizedClientLink
                    href={`/blog/${blogPost.slug}`}
                    className="absolute inset-0 z-10"
                />
            </div>

        </section>
    )
}

// 日期格式化辅助函数保持不变
function formatDate(dateString: string, locale: string): string {
    const date = new Date(dateString)
    if (locale === 'zh-CN' || locale.includes('zh')) {
        return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
    }
    return date.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })
}