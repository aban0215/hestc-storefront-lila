
import { Metadata } from "next"
import { getBlogPosts, getBlogCategories } from "@lib/strapi/blog-data"
import { getSelectedLocale } from "@lib/data/locales"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getBaseURL } from "@lib/util/env"
import BackButton from "@modules/account/components/back-button"
import { getSeoExtension } from "@lib/strapi/seo"


type Props = {
    params: Promise<{ countryCode: string }>
    searchParams: Promise<{ category?: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
    const { countryCode } = await props.params
    const seo = await getSeoExtension('blog-key')
    const baseUrl = getBaseURL()
    const canonicalUrl = `${baseUrl}/us/blog`

    return {
        title: seo?.metaTitle || "Lila Journal | Blog",
        description: seo?.metaDescription,
        keywords: seo?.keywords,
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            title: seo?.metaTitle,
            description: seo?.metaDescription,
            url: canonicalUrl,
            images: seo?.shareImage?.url ? [{ url: seo.shareImage.url }] : [],
        },
    }
}

export default async function BlogArchivePage(props: Props) {
    const { countryCode } = await props.params
    const { category: activeCategorySlug } = await props.searchParams
    const locale = (await getSelectedLocale()) || 'en-US'

    const [categories, posts] = await Promise.all([
        getBlogCategories(locale),
        getBlogPosts(locale, activeCategorySlug)
    ])

    return (
        <div className="w-full bg-white">
            {/* 1. 吸顶工具栏：对齐 Category 页面的风格 */}
            <div className="sticky top-[55px] lg:top-[80px] z-[50] bg-white border-b border-gray-100">
                <div className="w-full px-4 md:px-8 py-4 flex items-center justify-between">
                    {/* 左侧：返回键 + 页面标题 */}
                    <div className="flex items-center gap-x-4">
                        <BackButton className="text-black !tracking-[0.1em]" />
                        <div className="h-3 w-[1px] bg-gray-200" />
                        <h1 className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-900">
                            Lila Journal
                        </h1>
                    </div>

                    {/* 右侧：显示当前分类名（移动端友好） */}
                    <div className="text-[9px] text-gray-400 uppercase tracking-[0.15em]">
                        {activeCategorySlug ? `Category: ${activeCategorySlug}` : 'All Stories'}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                {/* 原本的大 H1 标题可以去掉了，或者缩小放在这里作为副标题 */}

                <div className="flex flex-col md:flex-row gap-12">
                    {/* --- 左侧筛选器 (25%) --- */}
                    <aside className="w-full md:w-1/4">
                        {/* 这里的 top 值要考虑到吸顶工具栏的高度，建议设为 40 (大约 160px 左右) */}
                        <div className="sticky top-40">
                            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] mb-6 border-b border-gray-100 pb-2">
                                Categories
                            </h3>
                            <ul className="space-y-4">
                                <li>
                                    <LocalizedClientLink
                                        href="/blog"
                                        className={`text-[10px] uppercase tracking-widest transition-colors ${!activeCategorySlug ? 'text-black font-bold' : 'text-gray-400 hover:text-black'}`}
                                    >
                                        All Posts
                                    </LocalizedClientLink>
                                </li>
                                {categories.map((cat: any) => (
                                    <li key={cat.id}>
                                        <LocalizedClientLink
                                            href={`/blog?category=${cat.slug}`}
                                            className={`text-[10px] uppercase tracking-widest transition-colors ${activeCategorySlug === cat.slug ? 'text-black font-bold' : 'text-gray-400 hover:text-black'}`}
                                        >
                                            {cat.name}
                                        </LocalizedClientLink>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </aside>

                    {/* --- 右侧文章列表 (75%) --- */}
                    <main className="w-full md:w-3/4">
                        {posts.length === 0 ? (
                            <div className="py-20 text-center text-[11px] tracking-widest text-gray-400 uppercase italic">
                                No posts found in this category.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
                                {posts.map((post: any) => {
                                    const media = post.coverImage;
                                    const isVideo = media?.mime?.includes('video');
                                    const mediaUrl = media?.url;

                                    return (
                                        <LocalizedClientLink
                                            key={post.id}
                                            href={`/blog/${post.slug}`}
                                            className="group flex flex-col"
                                        >
                                            <div className="aspect-[16/10] overflow-hidden bg-gray-50 mb-6 relative">
                                                {mediaUrl ? (
                                                    isVideo ? (
                                                        <video
                                                            src={mediaUrl} autoPlay muted loop playsInline
                                                            poster={`${mediaUrl}?x-oss-process=video/snapshot,t_1000,f_jpg`}
                                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                        />
                                                    ) : (
                                                        <img
                                                            src={mediaUrl}
                                                            alt={post.title}
                                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                            loading="lazy"
                                                        />
                                                    )
                                                ) : null}
                                            </div>

                                            <div className="flex items-center gap-3 mb-3 text-[9px] uppercase tracking-[0.2em] font-bold text-gray-900">
                                                <span>{post.lila_blog_category?.name || post.category?.name}</span>
                                                <span className="text-gray-200">|</span>
                                                <span className="text-gray-400 font-light">{post.readTime || '5'} MIN READ</span>
                                            </div>

                                            <h2 className="text-lg md:text-xl font-medium mb-3 group-hover:text-gray-500 transition-colors leading-snug">
                                                {post.title}
                                            </h2>

                                            <p className="text-gray-500 text-[11px] line-clamp-2 mb-6 leading-6 font-light tracking-wide">
                                                {post.excerpt}
                                            </p>

                                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] border-b border-black self-start pb-1 group-hover:text-gray-400 group-hover:border-gray-400 transition-all">
                                                Read Article
                                            </span>
                                        </LocalizedClientLink>
                                    );
                                })}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    )
}