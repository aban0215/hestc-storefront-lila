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
 * 专门获取 SEO 数据
 */
export async function generateMetadata(props: Props): Promise<Metadata> {
    const { slug } = await props.params
    const postEn = await getBlogPostBySlug(slug, "en-US")

    if (!postEn) {
        return { title: "Blog Post Not Found" }
    }

    const baseUrl = getBaseURL()
    const mainCountry = "us"
    const canonicalUrl = `${baseUrl}/${mainCountry}/blog/${slug}`

    // SEO 专用图片逻辑：如果是视频，尝试取预览图，否则取 URL
    const seoImageUrl = postEn.blogSeo?.shareImage || postEn.coverImage?.url || ""

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
            images: seoImageUrl ? [{ url: seoImageUrl }] : [],
        },
        twitter: {
            card: "summary_large_image",
            title: postEn.blogSeo?.metaTitle || postEn.title,
            description: postEn.blogSeo?.metaDescription || postEn.excerpt,
            images: seoImageUrl ? [seoImageUrl] : [],
        }
    }
}

export default async function BlogDetailPage(props: Props) {
    const { slug } = await props.params

    // 根据当前站点的语言环境获取内容
    const locale = (await getSelectedLocale()) || 'en-US'
    const post = await getBlogPostBySlug(slug, locale)

    if (!post) {
        notFound()
    }

    // 媒体解析逻辑
    const media = post.coverImage
    const mediaUrl = media?.url || null
    const isVideo = media?.mime?.includes('video')

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

                {/* 封面区域：兼容图片与视频 */}
                {mediaUrl && (
                    <div className="relative aspect-[21/9] w-full overflow-hidden rounded-sm shadow-lg bg-gray-100">
                        {isVideo ? (
                            <video
                                src={mediaUrl}
                                autoPlay
                                muted
                                loop
                                playsInline
                                // 性能优化：OSS 视频截帧作为封面
                                poster={`${mediaUrl}?x-oss-process=video/snapshot,t_1000,f_jpg`}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <img
                                src={mediaUrl}
                                alt={media.alternativeText || post.title}
                                className="w-full h-full object-cover"
                            />
                        )}
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
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                // 这里的 img 会处理 Markdown 语法中的 ![alt](url)
                                img: ({ node, src, alt, ...props }) => {
                                    const isVideo = src?.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i);

                                    if (isVideo) {
                                        return (
                                            <video
                                                src={src}
                                                controls   // 正文视频通常建议带进度条，方便用户观看
                                                playsInline
                                                className="w-full rounded-md my-4 shadow-sm"
                                            >
                                                您的浏览器不支持视频播放。
                                            </video>
                                        );
                                    }
                                    // 如果是普通图片，则正常渲染
                                    return (
                                        <img
                                            src={src}
                                            alt={alt}
                                            className="w-full rounded-md my-4 shadow-sm"
                                            loading="lazy"
                                            {...props}
                                        />
                                    );
                                },
                            }}
                        >
                            {post.content}
                        </ReactMarkdown>
                    </div>

                    {/* --- 底部导航 --- */}
                    <div className="mt-16 pt-8 border-t border-gray-100 flex justify-end items-center">
                        <LocalizedClientLink
                            href="/blog"
                            className="text-sm font-bold tracking-widest uppercase border-b-2 border-pink-600 pb-1 hover:text-pink-600 transition-colors"
                        >
                            Read More Stories
                        </LocalizedClientLink>
                    </div>
                </div>
            </div>
        </article>
    )
}