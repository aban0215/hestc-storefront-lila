import { getLatestBlogPost, getBlogModuleSettings } from '../../../lib/strapi/blog-data'
import { getSelectedLocale } from '@lib/data/locales'
import LocalizedClientLink from '@modules/common/components/localized-client-link'

export default async function BlogShowcase() {
    const localecode = (await getSelectedLocale()) || 'en-US'

    // 并行获取数据
    const [settingsData, blogPost] = await Promise.all([
        getBlogModuleSettings(localecode),
        getLatestBlogPost(localecode) // 已经返回了 data[0]，所以这里直接就是文章对象
    ])

    // 处理设置项的嵌套
    const settings = settingsData?.data?.data || settingsData?.data || settingsData;

    // 健壮性检查：如果没有设置或没有文章，不渲染
    if (!settings?.showModule || !blogPost) {
        return null
    }

    // --- 逻辑解析 ---
    const getTargetHref = () => {
        // 优先使用 medusaHandle，其次是 slug
        const handle = blogPost.medusaHandle || blogPost.slug;
        const type = blogPost.link_type || blogPost.linkType;

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
    const media = blogPost.coverImage;
    const isVideo = media?.mime?.includes('video');
    const mediaUrl = media?.url;

    return (
        <section className="relative w-full overflow-hidden bg-white border-t border-gray-50">
            {/* 1. 顶部标题区域 */}
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

            {/* 2. 核心展示区域 */}
            <div className="group relative w-full h-[65vh] md:h-[75vh] min-h-[500px] overflow-hidden">
                <div className="absolute inset-0">
                    {mediaUrl && (
                        isVideo ? (
                            <video
                                src={mediaUrl}
                                autoPlay
                                muted
                                loop
                                playsInline
                                poster={`${mediaUrl}?x-oss-process=video/snapshot,t_1000,f_jpg`}
                                className="w-full h-full object-cover transition-transform duration-[2000ms] ease-out group-hover:scale-110"
                            />
                        ) : (
                            <img
                                src={mediaUrl}
                                alt={media.alternativeText || blogPost.title}
                                className="w-full h-full object-cover transition-transform duration-[2000ms] ease-out group-hover:scale-110"
                                loading="lazy"
                            />
                        )
                    )}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />
                </div>

                {/* 3. 文字内容层 */}
                <div className="relative h-full flex items-center justify-center text-center px-6 pointer-events-none">
                    <div className="max-w-4xl text-white">
                        <div className="flex flex-wrap justify-center items-center gap-6 mb-8 text-[10px] md:text-xs tracking-[0.2em] text-gray-100 uppercase font-medium">
                            {/* 注意：你的数据里分类字段名是 lila_blog_category */}
                            {(settings.showCategory && blogPost.lila_blog_category) && (
                                <span className="px-3 py-1 border border-white/40">
                                    {blogPost.lila_blog_category.name}
                                </span>
                            )}
                            {settings.showPublishDate && blogPost.publishedAt && (
                                <span>{formatDate(blogPost.publishedAt, localecode)}</span>
                            )}
                        </div>

                        <h3 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold mb-8 leading-tight drop-shadow-lg">
                            {blogPost.title}
                        </h3>

                        <p className="text-gray-100 text-sm md:text-lg mb-12 max-w-2xl mx-auto opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-700 ease-out font-light leading-relaxed line-clamp-2 md:line-clamp-none">
                            {blogPost.excerpt}
                        </p>

                        <div className="flex flex-col items-center gap-8 pointer-events-auto">
                            <LocalizedClientLink
                                href={targetHref}
                                className="px-12 py-4 border border-white text-white text-xs font-bold tracking-[0.2em] uppercase hover:bg-white hover:text-black transition-all duration-300"
                            >
                                {settings.readButtonText?.toUpperCase() || 'READ MORE'}
                            </LocalizedClientLink>

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

                <LocalizedClientLink
                    href={targetHref}
                    className="absolute inset-0 z-[5]"
                    aria-label={blogPost.title}
                />
            </div>
        </section>
    )
}

function formatDate(dateString: string, locale: string): string {
    try {
        const date = new Date(dateString)
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString(locale.includes('zh') ? 'zh-CN' : locale, options)
    } catch (e) {
        return dateString;
    }
}