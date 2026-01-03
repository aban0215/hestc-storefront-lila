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

    // 处理 Strapi 可能的嵌套层级
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

    const imageUrl = blogPost.coverImage?.url
        ? `${blogPost.coverImage.url}`
        : null

    return (
        <section className="relative w-full overflow-hidden bg-white border-t border-gray-50">

            {/* 1. 模块标题区域 - 统一间距 py-8 md:py-14 */}
            {/*<div className="w-full py-8 md:py-14 px-10 flex flex-col items-center justify-center text-center">*/}
            {/*    <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 leading-tight">*/}
            {/*        {settings.moduleTitle}*/}
            {/*    </h2>*/}
            {/*    {settings.moduleDescription && (*/}
            {/*        <p className="mt-3 md:mt-4 text-sm md:text-base text-gray-400 font-light tracking-[0.3em] italic uppercase">*/}
            {/*            {settings.moduleDescription}*/}
            {/*        </p>*/}
            {/*    )}*/}
            {/*    /!* 统一的粉色装饰线 *!/*/}
            {/*    <div className="mt-5 w-16 h-[1px] bg-pink-600/40" />*/}
            {/*</div>*/}

            <div className="w-full py-6 px-10 flex flex-col items-center justify-center border-b border-gray-50 text-center">
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 leading-tight">
                    {settings.moduleTitle}
                </h2>
                {settings.moduleDescription && (
                    <p className="mt-2 text-sm md:text-base text-gray-400 font-light tracking-widest italic uppercase">
                        {settings.moduleDescription}
                    </p>
                )}
            </div>


            {/* 2. 沉浸式博客平铺区域 */}
            <div className="group relative w-full h-[65vh] md:h-[75vh] min-h-[500px] overflow-hidden">
                <div className="absolute inset-0">
                    {imageUrl && (
                        <img
                            src={imageUrl}
                            alt={blogPost.coverImage.alternativeText || blogPost.title}
                            className="w-full h-full object-cover transition-transform duration-[2000ms] ease-out group-hover:scale-110"
                            loading="lazy"
                        />
                    )}
                    {/* 遮罩颜色动效与 Category 一致 */}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />
                </div>

                <div className="relative h-full flex items-center justify-center text-center px-6">
                    <div className="max-w-4xl text-white">
                        {/* 标签与日期 */}
                        <div className="flex flex-wrap justify-center items-center gap-6 mb-8 text-[10px] md:text-xs tracking-[0.2em] text-gray-100 uppercase font-medium">
                            {settings.showCategory && blogPost.category && (
                                <span className="px-3 py-1 border border-white/40">
                                    {blogPost.category.name}
                                </span>
                            )}
                            {settings.showPublishDate && blogPost.publishedAt && (
                                <span>{formatDate(blogPost.publishedAt, localecode)}</span>
                            )}
                        </div>

                        {/* 文章主标题 */}
                        <h3 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold mb-8 leading-tight drop-shadow-lg">
                            {blogPost.title}
                        </h3>

                        {/* 描述文本 (Excerpt)：对标一致的悬停升起效果 */}
                        <p className="text-gray-100 text-sm md:text-lg mb-12 max-w-2xl mx-auto opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-700 ease-out font-light leading-relaxed line-clamp-2 md:line-clamp-none">
                            {blogPost.excerpt}
                        </p>

                        <div className="flex flex-col items-center gap-8">
                            {/* 阅读按钮 */}
                            <LocalizedClientLink
                                href={targetHref}
                                className="px-12 py-4 border border-white text-white text-xs font-bold tracking-[0.2em] uppercase hover:bg-white hover:text-black transition-all duration-300"
                            >
                                {settings.readButtonText?.toUpperCase() || 'READ MORE'}
                            </LocalizedClientLink>

                            {/* 查看全部 */}
                            <LocalizedClientLink
                                href="/blog"
                                className="inline-flex items-center gap-2 text-white/70 font-bold text-[10px] tracking-[0.2em] uppercase hover:text-white transition-colors group/all"
                            >
                                <span>{settings.viewAllButtonText || 'View All News'}</span>
                                <svg className="w-4 h-4 transition-transform group-hover/all:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </LocalizedClientLink>
                        </div>
                    </div>
                </div>

                {/* 全区域点击热区 */}
                <LocalizedClientLink
                    href={targetHref}
                    className="absolute inset-0 z-10"
                    aria-label={blogPost.title}
                />
            </div>
        </section>
    )
}

// 日期格式化辅助函数
function formatDate(dateString: string, locale: string): string {
    const date = new Date(dateString)
    if (locale === 'zh-CN' || locale.includes('zh')) {
        return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
    }
    return date.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })
}