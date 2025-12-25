import { getLatestBlogPost, getBlogModuleSettings } from '../../../lib/strapi/blog-data'
import { getSelectedLocale } from '@lib/data/locales'
import LocalizedClientLink from '@modules/common/components/localized-client-link'

export default async function BlogShowcase() {
    const localecode = (await getSelectedLocale()) || 'en-US'

    // 并行获取设置和最新文章
    const [settingsData, blogPost] = await Promise.all([
        getBlogModuleSettings(localecode),
        getLatestBlogPost(localecode)
    ])

    // 处理 Strapi 5 可能的嵌套层级
    const settings = settingsData?.data?.data || settingsData?.data || settingsData;

    if (!settings?.showModule || !blogPost) {
        return null
    }

    // --- 统一跳转逻辑解析 ---
    const getTargetHref = () => {
        const handle = blogPost.medusaHandle || blogPost.slug;
        const type = blogPost.linkType;

        if (!handle) return "/blog";

        switch (type) {
            case 'category': return `/categories/${handle}`;
            case 'collection': return `/collections/${handle}`;
            case 'product': return `/products/${handle}`;
            case 'blog': return `/blog/${handle}`;
            case 'external': return handle;
            default: return `/blog/${handle}`;
        }
    }

    const targetHref = getTargetHref();
    // -----------------------

    const imageUrl = blogPost.coverImage?.url
        ? `${blogPost.coverImage.url}`
        : null

    return (
        <section className="relative w-full overflow-hidden bg-white border-t border-gray-100">
            {/* 1. 模块标题区域 */}
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col items-center text-center gap-3">
                    <div className="relative overflow-hidden group">
                        <h2 className="text-xl md:text-2xl font-serif font-bold text-gray-900 tracking-[0.15em] transition-all duration-700 ease-out transform translate-y-0 group-hover:-translate-y-1">
                            {settings.moduleTitle}
                        </h2>
                        <div className="w-8 h-[1.5px] bg-pink-600 mx-auto mt-2 transform scale-x-100 transition-transform duration-500 group-hover:scale-x-150"></div>
                    </div>
                </div>
            </div>

            {/* 2. 沉浸式博客平铺区域 */}
            <div className="group relative w-full h-[70vh] min-h-[500px] overflow-hidden">
                <div className="absolute inset-0">
                    {imageUrl && (
                        <img
                            src={imageUrl}
                            alt={blogPost.coverImage.alternativeText || blogPost.title}
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                            loading="lazy"
                        />
                    )}
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-500" />
                </div>

                <div className="relative h-full flex items-center justify-center text-center px-6">
                    <div className="max-w-3xl text-white">
                        <div className="flex flex-wrap justify-center items-center gap-6 mb-6 text-xs md:text-sm tracking-[0.1em] text-gray-200">
                            {settings.showCategory && blogPost.category && (
                                <span className="px-3 py-1 border border-white/40 uppercase font-medium">
                                    {blogPost.category.name}
                                </span>
                            )}
                            {settings.showPublishDate && blogPost.publishedAt && (
                                <span>{formatDate(blogPost.publishedAt, localecode)}</span>
                            )}
                        </div>

                        <h3 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold mb-6 leading-tight">
                            {blogPost.title}
                        </h3>

                        <p className="text-gray-200 text-sm md:text-lg mb-10 max-w-2xl mx-auto opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-700 line-clamp-2 md:line-clamp-none">
                            {blogPost.excerpt}
                        </p>

                        <div className="flex flex-col items-center gap-6">
                            <LocalizedClientLink
                                href={targetHref}
                                className="px-10 py-4 border border-white text-white text-xs font-bold tracking-[0.2em] hover:bg-white hover:text-black transition-all duration-300"
                            >
                                {settings.readButtonText?.toUpperCase() || 'READ MORE'}
                            </LocalizedClientLink>

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

                {/* 全区域点击感应使用解析后的 targetHref */}
                {/*<LocalizedClientLink*/}
                {/*    href={targetHref}*/}
                {/*    className="absolute inset-0 z-10"*/}
                {/*/>*/}
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