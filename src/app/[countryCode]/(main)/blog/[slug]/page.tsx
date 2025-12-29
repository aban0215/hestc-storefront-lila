import { Metadata } from "next"
import { notFound } from "next/navigation"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { getBlogPostBySlug } from "@lib/strapi/blog-data"
import { getSelectedLocale } from "@lib/data/locales"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getBaseURL } from "@lib/util/env"

type Props = {
    params: Promise<{ slug: string; countryCode: string }>
}

/**
 * 为 Metadata 专门获取 SEO 数据
 * 强制使用 en-US，实现单中心索引
 */
export async function generateMetadata(props: Props): Promise<Metadata> {
    const { slug } = await props.params

    // 强制请求英文版 SEO 内容
    const postEn = await getBlogPostBySlug(slug, "en-US")

    if (!postEn) {
        return { title: "Blog Post Not Found" }
    }

    const baseUrl = getBaseURL()
    const mainCountry = "us"
    // 锁定 Canonical URL，无论在哪个语言环境下，都指向美国站版本
    const canonicalUrl = `${baseUrl}/${mainCountry}/blog/${slug}`

    return {
        title: postEn.blogSeo?.metaTitle || postEn.title,
        description: postEn.blogSeo?.metaDescription || postEn.excerpt,
        keywords: postEn.blogSeo?.keywords,
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            title: postEn.blogSeo?.metaTitle || postEn.title,
            description: postEn.blogSeo?.metaDescription || postEn.excerpt,
            url: canonicalUrl,
            images: postEn.blogSeo?.shareImage ? [postEn.blogSeo.shareImage] : (postEn.coverImage.url ? [postEn.coverImage.url] : []),
        },
        twitter: {
            card: "summary_large_image",
            title: postEn.blogSeo?.metaTitle || postEn.title,
            description: postEn.blogSeo?.metaDescription || postEn.excerpt,
            images: postEn.blogSeo?.shareImage ? [postEn.blogSeo.shareImage] : (postEn.coverImage.url ? [postEn.coverImage.url] : []),
        }
    }
}

export default async function BlogDetailPage(props: Props) {
    const { slug, countryCode } = await props.params

    // 根据当前站点的语言环境获取内容（用于页面渲染显示）
    const locale = (await getSelectedLocale()) || 'en-US'
    const post = await getBlogPostBySlug(slug, locale)

    if (!post) {
        notFound()
    }

    const fullImageUrl = post.coverImage.url || null

    return (
        <article className="min-h-screen bg-white">
            {/* --- Hero 头部区域 --- */}
            <header className="container mx-auto px-4 mb-12">
                <div className="max-w-4xl mx-auto text-center mt-12 mb-10">
                    <h1 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 mb-6 leading-tight">
                        {post.title}
                    </h1>

                    <div className="flex items-center justify-center gap-4 text-gray-500 text-sm italic">
                        <span>By {post.author || "Admin"}</span>
                        <span>•</span>
                        <span>{new Date(post.publishedAt).toLocaleDateString(locale, { dateStyle: 'long' })}</span>
                        {post.readTime && (
                            <>
                                <span>•</span>
                                <span>{post.readTime} min read</span>
                            </>
                        )}
                    </div>
                </div>

                {/* 封面图 */}
                {fullImageUrl && (
                    <div className="relative aspect-[21/9] w-full overflow-hidden rounded-sm shadow-lg">
                        <img
                            src={fullImageUrl}
                            alt={post.coverImage.alternativeText || post.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}
            </header>

            {/* --- 正文区域 --- */}
            <div className="container mx-auto px-4 pb-20">
                <div className="max-w-3xl mx-auto">
                    <div className="prose prose-lg prose-pink max-w-none
                        prose-headings:font-serif prose-headings:font-bold
                        prose-p:text-gray-700 prose-p:leading-relaxed
                        prose-img:rounded-md prose-blockquote:italic prose-blockquote:text-pink-600">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {post.content}
                        </ReactMarkdown>
                    </div>

                    {/* --- 底部导航 --- */}
                    <div className="mt-16 pt-8 border-t border-gray-100 flex justify-end items-center">
                        <LocalizedClientLink
                            href="/blog"
                            className="text-sm font-bold tracking-widest uppercase border-b-2 border-pink-600 pb-1"
                        >
                            Read More Stories
                        </LocalizedClientLink>
                    </div>
                </div>
            </div>
        </article>
    )
}