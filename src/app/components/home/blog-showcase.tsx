import { getLatestBlogPost, getBlogModuleSettings } from '../../../lib/strapi/blog-data'
import { getSelectedLocale } from '@lib/data/locales'
import LocalizedClientLink from '@modules/common/components/localized-client-link'

export default async function BlogShowcase() {
    const localecode = (await getSelectedLocale()) || 'en-US'

    const [settingsData, blogPost] = await Promise.all([
        getBlogModuleSettings(localecode),
        getLatestBlogPost(localecode)
    ])

    const settings = settingsData?.data?.data || settingsData?.data || settingsData;

    if (!settings?.showModule || !blogPost) return null

    const targetHref = `/blog/${blogPost.medusaHandle || blogPost.slug}`;
    const media = blogPost.coverImage;
    const mediaUrl = media?.url;
    const isVideo = media?.mime?.includes('video');

    return (
        <section className="bg-white pt-12 pb-16 border-t border-gray-50 overflow-hidden">
            {/* 1. 标题区域：保持简洁 */}
            <div className="w-full mb-8 md:mb-12 px-4 text-center">
                <h2 className="text-[13px] md:text-[15px] font-bold text-gray-900 tracking-[0.3em] uppercase">
                    {settings.moduleTitle}
                </h2>
                <div className="mt-3 h-[1px] w-6 bg-gray-200 mx-auto"></div>
            </div>

            {/* 2. 核心区域：PC 端改为左右布局 */}
            <div className="container mx-auto px-4 max-w-6xl">
                <LocalizedClientLink href={targetHref} className="group block">
                    <div className="flex flex-col md:flex-row md:items-center md:gap-16">

                        {/* 媒体部分：PC 端占据 60% 宽度 */}
                        <div className="relative aspect-[3/2] md:aspect-[4/3] md:w-[60%] overflow-hidden bg-gray-50 flex-shrink-0">
                            {mediaUrl && (
                                isVideo ? (
                                    <video src={mediaUrl} autoPlay muted loop playsInline className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                                ) : (
                                    <img src={mediaUrl} alt={blogPost.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                                )
                            )}
                        </div>

                        {/* 文字内容：PC 端居左对齐，垂直居中 */}
                        <div className="mt-8 md:mt-0 flex flex-col items-center md:items-start text-center md:text-left flex-1">
                            {/* 分类与日期 */}
                            <div className="flex items-center gap-3 text-[9px] tracking-[0.1em] text-gray-400 uppercase mb-4">
                                {(settings.showCategory && blogPost.lila_blog_category) && (
                                    <span className="text-gray-900 font-bold">{blogPost.lila_blog_category.name}</span>
                                )}
                                <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                                <span>{formatDate(blogPost.publishedAt, localecode)}</span>
                            </div>

                            {/* 标题：PC 端字体加大，行高收紧 */}
                            <h3 className="text-xl md:text-3xl font-medium text-gray-900 mb-4 tracking-tight leading-[1.2] transition-colors group-hover:text-gray-600">
                                {blogPost.title}
                            </h3>

                            {/* 摘要：PC 端增加可读性 */}
                            <p className="text-gray-500 text-[11px] md:text-sm leading-6 md:leading-7 font-light tracking-wide mb-8 line-clamp-3 md:line-clamp-4">
                                {blogPost.excerpt}
                            </p>

                            {/* 交互按钮组 */}
                            <div className="flex flex-col items-center md:items-start gap-6">
                                <div className="inline-block border-b border-black pb-1 text-[10px] font-bold tracking-[0.2em] uppercase transition-all group-hover:text-gray-400 group-hover:border-gray-400">
                                    {settings.readButtonText || 'Read More'}
                                </div>

                                <LocalizedClientLink
                                    href="/blog"
                                    className="text-[9px] tracking-[0.2em] text-gray-300 uppercase hover:text-black transition-colors md:mt-4"
                                >
                                    — {settings.viewAllButtonText || 'All Stories'} —
                                </LocalizedClientLink>
                            </div>
                        </div>
                    </div>
                </LocalizedClientLink>
            </div>
        </section>
    )
}

function formatDate(dateString: string, locale: string): string {
    try {
        const date = new Date(dateString)
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString(locale.includes('zh') ? 'zh-CN' : locale, options)
    } catch (e) { return dateString; }
}