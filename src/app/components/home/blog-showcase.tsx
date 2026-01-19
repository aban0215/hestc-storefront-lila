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
        <section className="bg-white pt-24 pb-20 border-t border-gray-50">
            {/* 1. 顶部标题 - 极致缩小对齐全站 */}
            <div className="w-full mb-16 px-4 text-center">
                <h2 className="text-[14px] md:text-[16px] font-bold text-gray-900 tracking-[0.4em] uppercase">
                    {settings.moduleTitle}
                </h2>
                <div className="mt-4 h-[1px] w-8 bg-gray-200 mx-auto"></div>
            </div>

            {/* 2. 杂志感主体区域 */}
            <div className="container mx-auto px-6 max-w-5xl">
                <LocalizedClientLink href={targetHref} className="group block">
                    {/* 图片容器 - 比例调整为更具电影感的 16:9 或 3:2 */}
                    <div className="relative aspect-video md:aspect-[21/9] overflow-hidden bg-gray-50">
                        {mediaUrl && (
                            isVideo ? (
                                <video src={mediaUrl} autoPlay muted loop playsInline className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105" />
                            ) : (
                                <img src={mediaUrl} alt={blogPost.title} className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105" />
                            )
                        )}
                    </div>

                    {/* 3. 文字内容 - 纯白背景上的排版 */}
                    <div className="mt-10 flex flex-col items-center text-center">
                        {/* 标签与日期 */}
                        <div className="flex items-center gap-4 text-[9px] tracking-[0.2em] text-gray-400 uppercase mb-6">
                            {(settings.showCategory && blogPost.lila_blog_category) && (
                                <span className="text-gray-900 font-bold">{blogPost.lila_blog_category.name}</span>
                            )}
                            {settings.showPublishDate && (
                                <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                            )}
                            {settings.showPublishDate && (
                                <span>{formatDate(blogPost.publishedAt, localecode)}</span>
                            )}
                        </div>

                        {/* 文章标题 - 从 3xl 降为 2xl，增加质感 */}
                        <h3 className="text-xl md:text-3xl font-medium text-gray-900 mb-6 tracking-tight leading-relaxed max-w-3xl">
                            {blogPost.title}
                        </h3>

                        {/* 摘要 - 增加行高和字间距 */}
                        <p className="text-gray-500 text-xs md:text-sm leading-8 max-w-2xl font-light tracking-wide mb-10">
                            {blogPost.excerpt}
                        </p>

                        {/* 按钮 - 极细线设计 */}
                        <div className="inline-block border-b border-black pb-1 text-[10px] font-bold tracking-[0.2em] uppercase transition-all group-hover:text-gray-400 group-hover:border-gray-400">
                            {settings.readButtonText || 'Read Article'}
                        </div>
                    </div>
                </LocalizedClientLink>

                {/* 4. 底部的 View All */}
                <div className="mt-20 flex justify-center">
                    <LocalizedClientLink
                        href="/blog"
                        className="text-[9px] tracking-[0.3em] text-gray-300 uppercase hover:text-black transition-colors"
                    >
                        {settings.viewAllButtonText || 'Discover All Stories'}
                    </LocalizedClientLink>
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