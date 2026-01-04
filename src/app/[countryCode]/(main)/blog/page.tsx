// app/[countryCode]/blog/page.tsx

import { Metadata } from "next"
import { getBlogPosts, getBlogCategories } from "@lib/strapi/blog-data"
import { getSelectedLocale } from "@lib/data/locales"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getBaseURL } from "@lib/util/env"

type Props = {
    params: Promise<{ countryCode: string }>
    searchParams: Promise<{ category?: string }>
}

/**
 * 获取博客列表页专用 SEO 补丁
 */
async function getBlogArchiveSeo() {
    // 建议将 IP 替换为环境变量或 getBaseURL 处理
    const STRAPI_URL = "http://47.89.151.64:1337"
    const query = `${STRAPI_URL}/api/lila-seo-extensions?filters[key][$eq]=blog-key&locale=en-US&populate[lilaSeo][populate]=shareImage`
    try {
        const res = await fetch(query, { next: { revalidate: 3600 } })
        const { data } = await res.json()
        return data?.[0]?.lilaSeo?.[0] || null
    } catch (e) {
        return null
    }
}

export async function generateMetadata(props: Props): Promise<Metadata> {
    const { countryCode } = await props.params
    const seo = await getBlogArchiveSeo()
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
            images: seo?.shareImage?.[0]?.url ? [{ url: seo.shareImage[0].url }] : [],
        },
    }
}

export default async function BlogArchivePage(props: Props) {
    const { countryCode } = await props.params
    const { category: activeCategorySlug } = await props.searchParams

    const locale = (await getSelectedLocale()) || 'en-US'

    // 并行获取分类和文章
    const [categories, posts] = await Promise.all([
        getBlogCategories(locale),
        getBlogPosts(locale, activeCategorySlug)
    ])

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-serif font-bold mb-12 text-center uppercase tracking-widest">
                Lila Journal
            </h1>

            <div className="flex flex-col md:flex-row gap-12">
                {/* --- 左侧筛选器 (25%) --- */}
                <aside className="w-full md:w-1/4">
                    <div className="sticky top-24">
                        <h3 className="text-sm font-bold uppercase tracking-widest mb-6 border-b pb-2">
                            Categories
                        </h3>
                        <ul className="space-y-4">
                            <li>
                                <LocalizedClientLink
                                    href="/blog"
                                    className={`text-sm hover:text-pink-600 transition-colors ${!activeCategorySlug ? 'text-pink-600 font-bold' : 'text-gray-500'}`}
                                >
                                    All Posts
                                </LocalizedClientLink>
                            </li>
                            {categories.map((cat: any) => (
                                <li key={cat.id}>
                                    <LocalizedClientLink
                                        href={`/blog?category=${cat.slug}`}
                                        className={`text-sm hover:text-pink-600 transition-colors ${activeCategorySlug === cat.slug ? 'text-pink-600 font-bold' : 'text-gray-500'}`}
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
                        <div className="py-20 text-center text-gray-400 italic">
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
                                        <div className="aspect-[16/10] overflow-hidden bg-gray-100 mb-4 relative">
                                            {mediaUrl ? (
                                                isVideo ? (
                                                    <video
                                                        src={mediaUrl}
                                                        autoPlay
                                                        muted
                                                        loop
                                                        playsInline
                                                        // 列表页建议强制截取第1帧作为海报，减少白屏感
                                                        poster={`${mediaUrl}?x-oss-process=video/snapshot,t_1000,f_jpg`}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <img
                                                        src={mediaUrl}
                                                        alt={media.alternativeText || post.title}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                        loading="lazy"
                                                    />
                                                )
                                            ) : null}
                                        </div>

                                        <div className="flex items-center gap-3 mb-2 text-[10px] uppercase tracking-widest font-bold text-pink-600">
                                            <span>{post.lila_blog_category?.name || post.category?.name}</span>
                                            <span className="text-gray-300">•</span>
                                            <span className="text-gray-400">{post.readTime || '5'} MIN READ</span>
                                        </div>

                                        <h2 className="text-xl font-serif font-bold mb-3 group-hover:text-pink-600 transition-colors">
                                            {post.title}
                                        </h2>

                                        <p className="text-gray-500 text-sm line-clamp-2 mb-4 leading-relaxed">
                                            {post.excerpt}
                                        </p>

                                        <span className="text-xs font-bold uppercase tracking-widest border-b border-black self-start pb-1 group-hover:text-pink-600 group-hover:border-pink-600 transition-all">
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
    )
}