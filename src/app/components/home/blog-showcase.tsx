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
        <section className="bg-white pt-16 border-t border-gray-50 overflow-hidden">
            {/* 1. 顶部标题区域 - 独立出来，保持居中 */}
            <div className="w-full mb-12 md:mb-16 px-6 text-center">
                <h2 className="text-[13px] md:text-[14px] font-bold text-gray-900 tracking-[0.4em] uppercase">
                    {settings.moduleTitle}
                </h2>
                <div className="mt-4 h-[1px] w-8 bg-gray-200 mx-auto"></div>
            </div>

            {/* 2. 核心内容区域：左图右文 */}
            {/* 使用 grid-cols-[1.2fr_0.8fr] 让图片略宽于文字区，视觉更平衡 */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] w-full min-h-[500px] lg:min-h-[650px]">

                {/* 左侧：图片完全靠左铺满 */}
                <LocalizedClientLink
                    href={targetHref}
                    className="relative w-full h-[450px] lg:h-full overflow-hidden bg-gray-100 group shadow-sm"
                >
                    {mediaUrl && (
                        isVideo ? (
                            <video
                                src={mediaUrl}
                                autoPlay muted loop playsInline
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                            />
                        ) : (
                            <img
                                src={mediaUrl}
                                alt={blogPost.title}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                            />
                        )
                    )}
                </LocalizedClientLink>

                {/* 右侧：文字在右侧剩余空间内垂直居中 */}
                <div className="flex items-center justify-center bg-white px-10 py-16 lg:px-20 lg:py-24">
                    {/* 控制文字块的最大宽度，防止在宽屏下显得太散 */}
                    <div className="max-w-md w-full flex flex-col items-center lg:items-start text-center lg:text-left">

                        {/* 分类与日期 */}
                        <div className="flex items-center gap-3 text-[10px] tracking-[0.15em] text-gray-400 uppercase mb-6">
                            {(settings.showCategory && blogPost.lila_blog_category) && (
                                <span className="text-gray-900 font-bold">{blogPost.lila_blog_category.name}</span>
                            )}
                            <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                            <span>{formatDate(blogPost.publishedAt, localecode)}</span>
                        </div>

                        {/* 文章标题 */}
                        <LocalizedClientLink href={targetHref} className="group">
                            <h3 className="text-2xl md:text-3xl lg:text-4xl font-medium text-gray-900 mb-6 tracking-tight leading-[1.2] transition-colors hover:text-gray-600">
                                {blogPost.title}
                            </h3>
                        </LocalizedClientLink>

                        {/* 摘要 */}
                        <p className="text-gray-500 text-sm leading-7 font-light tracking-wide mb-10 line-clamp-4">
                            {blogPost.excerpt}
                        </p>

                        {/* 交互按钮 */}
                        <div className="flex flex-col items-center lg:items-start gap-8 w-full">
                            <LocalizedClientLink
                                href={targetHref}
                                className="inline-block border-b border-black pb-1.5 text-[11px] font-bold tracking-[0.2em] uppercase transition-all hover:text-gray-400 hover:border-gray-400"
                            >
                                {settings.readButtonText || 'Read More'}
                            </LocalizedClientLink>

                            <LocalizedClientLink
                                href="/blog"
                                className="text-[10px] tracking-[0.2em] text-gray-300 uppercase hover:text-black transition-colors lg:mt-6"
                            >
                                — {settings.viewAllButtonText || 'All Stories'} —
                            </LocalizedClientLink>
                        </div>
                    </div>
                </div>
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