// src/components/home/blog-showcase/index.tsx

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
        // 1. 缩减模块顶部边距，从 pt-24 减到 pt-12
        <section className="bg-white pt-2 pb-16 border-t border-gray-50">

            {/* 2. 标题区域：缩减 mb-16 到 mb-8，让它紧贴图片 */}
            <div className="w-full mb-8 px-4 text-center">
                <h2 className="text-[13px] md:text-[15px] font-bold text-gray-900 tracking-[0.3em] uppercase">
                    {settings.moduleTitle}
                </h2>
                {/* 装饰线也缩短间距 */}
                <div className="mt-3 h-[1px] w-6 bg-gray-200 mx-auto"></div>
            </div>

            {/* 3. 核心区域 */}
            <div className="container mx-auto px-4 max-w-5xl">
                <LocalizedClientLink href={targetHref} className="group block">
                    {/* 调整媒体比例为 3:2，在手机上更紧凑 */}
                    <div className="relative aspect-[3/2] md:aspect-[21/9] overflow-hidden bg-gray-50">
                        {mediaUrl && (
                            isVideo ? (
                                <video src={mediaUrl} autoPlay muted loop playsInline className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            ) : (
                                <img src={mediaUrl} alt={blogPost.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            )
                        )}
                    </div>

                    {/* 4. 文字与按钮区域：全面紧缩 */}
                    <div className="mt-6 flex flex-col items-center text-center">
                        {/* 标签与日期：缩减 mb-6 到 mb-3 */}
                        <div className="flex items-center gap-3 text-[9px] tracking-[0.1em] text-gray-400 uppercase mb-3">
                            {(settings.showCategory && blogPost.lila_blog_category) && (
                                <span className="text-gray-900 font-bold">{blogPost.lila_blog_category.name}</span>
                            )}
                            <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                            <span>{formatDate(blogPost.publishedAt, localecode)}</span>
                        </div>

                        {/* 标题：缩减 mb-6 到 mb-3 */}
                        <h3 className="text-lg md:text-2xl font-medium text-gray-900 mb-3 tracking-tight leading-snug max-w-2xl px-4">
                            {blogPost.title}
                        </h3>

                        {/* 摘要：缩减 mb-10 到 mb-6，行高从 8 改为 6 */}
                        <p className="text-gray-500 text-[11px] md:text-sm leading-6 max-w-xl font-light tracking-wide mb-6 line-clamp-2">
                            {blogPost.excerpt}
                        </p>

                        {/* 5. 按钮重组：将两个链接放在同一排或紧凑排列 */}
                        <div className="flex flex-col items-center gap-6">
                            <div className="inline-block border-b border-black pb-1 text-[10px] font-bold tracking-[0.2em] uppercase transition-all group-hover:text-gray-400 group-hover:border-gray-400">
                                {settings.readButtonText || 'Read More'}
                            </div>

                            {/* “查看全部”紧跟其后，减少间距 */}
                            <LocalizedClientLink
                                href="/blog"
                                className="text-[9px] tracking-[0.2em] text-gray-300 uppercase hover:text-black transition-colors"
                            >
                                — {settings.viewAllButtonText || 'All Stories'} —
                            </LocalizedClientLink>
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