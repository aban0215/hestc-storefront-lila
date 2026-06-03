import Image from "next/image"
import { getFeaturedBlogPosts, getBlogModuleSettings } from '../../../lib/strapi/blog-data'
import { getSelectedLocale } from '@lib/data/locales'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import FadeUpOnScroll from "@modules/common/components/fade-up-on-scroll"

export default async function BlogShowcase() {
    const localecode = (await getSelectedLocale()) || 'en-US'

    const [settingsData, blogPosts] = await Promise.all([
        getBlogModuleSettings(localecode),
        getFeaturedBlogPosts(localecode, 2)
    ])

    const settings = settingsData?.data?.data || settingsData?.data || settingsData;

    if (!settings?.showModule || !blogPosts.length) return null

    return (
        <section className="bg-white pt-16 border-t border-gray-50 overflow-hidden">
            {/* 1. 顶部标题区域 - 独立出来，保持居中 */}
            <FadeUpOnScroll duration={800}>
                <div className="w-full mb-12 md:mb-16 px-6 text-center">
                    <h2 className="text-[13px] md:text-[14px] font-bold text-gray-900 tracking-[0.4em] uppercase">
                        {settings.moduleTitle}
                    </h2>
                    <div className="mt-4 h-[1px] w-8 bg-gray-200 mx-auto"></div>
                </div>
            </FadeUpOnScroll>

            {/* 2. 核心内容区域：2 篇博客左右排布 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 w-full gap-0">
                {blogPosts.slice(0, 2).map((post, idx) => {
                    const href = `/blog/${post.medusaHandle || post.slug}`
                    const postMedia = post.coverImage
                    const postMediaUrl = postMedia?.url
                    const postIsVideo = postMedia?.mime?.includes('video')

                    return (
                        <FadeUpOnScroll key={post.id || idx} delay={idx * 100} duration={800} className="w-full">
                        <LocalizedClientLink href={href} className="group block">
                            {/* 图片 */}
                            <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100">
                                {postMediaUrl && (
                                    postIsVideo ? (
                                        <video
                                            src={postMediaUrl}
                                            autoPlay muted loop playsInline
                                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                        />
                                    ) : (
                                        <Image
                                            src={postMediaUrl}
                                            alt={post.title}
                                            fill
                                            sizes="(max-width: 1024px) 100vw, 50vw"
                                            className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                        />
                                    )
                                )}
                            </div>
                            {/* 文字 */}
                            <div className="px-8 py-8 lg:px-12 lg:py-10 flex flex-col items-center lg:items-start text-center lg:text-left">
                                <div className="flex items-center gap-3 text-[10px] tracking-[0.15em] text-gray-400 uppercase mb-4">
                                    {(settings.showCategory && post.lila_blog_category) && (
                                        <span className="text-gray-900 font-bold">{post.lila_blog_category.name}</span>
                                    )}
                                    <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                                    <span>{formatDate(post.publishedAt, localecode)}</span>
                                </div>
                                <h3 className="text-xl md:text-2xl font-medium text-gray-900 mb-4 tracking-tight leading-[1.2] transition-colors group-hover:text-gray-600">
                                    {post.title}
                                </h3>
                                <p className="text-gray-500 text-sm leading-7 font-light tracking-wide mb-6 line-clamp-3">
                                    {post.excerpt}
                                </p>
                                <span className="inline-block border-b border-black pb-1.5 text-[11px] font-bold tracking-[0.2em] uppercase transition-all group-hover:text-gray-400 group-hover:border-gray-400">
                                    {settings.readButtonText || 'Read More'}
                                </span>
                            </div>
                        </LocalizedClientLink>
                        </FadeUpOnScroll>
                    )
                })}
            </div>

            {/* 底部 View All */}
            <FadeUpOnScroll delay={200} duration={700}>
                <div className="w-full flex justify-center mt-12 pb-8">
                    <LocalizedClientLink
                        href="/blog"
                        className="text-[10px] tracking-[0.2em] text-gray-300 uppercase hover:text-black transition-colors"
                    >
                        — {settings.viewAllButtonText || 'All Stories'} —
                    </LocalizedClientLink>
                </div>
            </FadeUpOnScroll>
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