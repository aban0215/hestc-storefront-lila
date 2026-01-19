import { Metadata } from "next"
import { notFound } from "next/navigation"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { getBlogPostBySlug } from "@lib/strapi/blog-data"
import { getSelectedLocale } from "@lib/data/locales"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getBaseURL } from "@lib/util/env"
import BackButton from "@modules/account/components/back-button"


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
    const locale = (await getSelectedLocale()) || 'en-US'
    const post = await getBlogPostBySlug(slug, locale)

    if (!post) {
        notFound()
    }

    const media = post.coverImage
    const mediaUrl = media?.url || null
    const isVideo = media?.mime?.includes('video')

    return (
        <article className="min-h-screen bg-white">
            {/* --- 1. 吸顶工具栏：与列表页和分类页完美对齐 --- */}
            <div className="sticky top-[110px] lg:top-[140px] z-[50] bg-white/90 backdrop-blur-md border-b border-gray-50">
                <div className="w-full px-4 md:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-x-4">
                        <BackButton className="text-black !tracking-[0.1em]" />
                        <div className="h-3 w-[1px] bg-gray-200" />
                        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-900 truncate max-w-[150px] md:max-w-none">
                            {post.title}
                        </span>
                    </div>

                    {/* 右侧：阅读进度感提示（可选，这里放分类名） */}
                    <div className="hidden sm:block text-[9px] text-gray-400 uppercase tracking-[0.15em]">
                        {post.lila_blog_category?.name || "Lila Journal"}
                    </div>
                </div>
            </div>

            {/* --- 2. Hero 头部区域 --- */}
            <header className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto text-center mt-16 mb-12">
                    {/* 分类标签 */}
                    {post.lila_blog_category && (
                        <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-4 block">
                            {post.lila_blog_category.name}
                        </span>
                    )}

                    <h1 className="text-3xl md:text-5xl font-medium text-gray-900 mb-8 leading-[1.2] tracking-tight">
                        {post.title}
                    </h1>

                    <div className="flex items-center justify-center gap-4 text-gray-400 text-[11px] uppercase tracking-widest">
                        <span>{post.author || "LILA ZEN"}</span>
                        <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                        <span>{new Date(post.publishedAt).toLocaleDateString(locale, { dateStyle: 'long' })}</span>
                        {post.readTime && (
                            <>
                                <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                                <span>{post.readTime} MIN READ</span>
                            </>
                        )}
                    </div>
                </div>

                {/* 封面区域：比例微调，去掉阴影，走极简平铺风 */}
                {mediaUrl && (
                    <div className="relative aspect-video md:aspect-[21/9] w-full overflow-hidden bg-gray-50 max-w-6xl mx-auto">
                        {isVideo ? (
                            <video
                                src={mediaUrl} autoPlay muted loop playsInline
                                poster={`${mediaUrl}?x-oss-process=video/snapshot,t_1000,f_jpg`}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <img
                                src={mediaUrl}
                                alt={post.title}
                                className="w-full h-full object-cover transition-transform duration-[2000ms] hover:scale-105"
                            />
                        )}
                    </div>
                )}
            </header>

            {/* --- 3. 正文区域 --- */}
            <div className="container mx-auto px-4 pt-16 pb-24">
                <div className="max-w-2xl mx-auto"> {/* 缩窄正文宽度，提升阅读舒适度 */}
                    <div className="prose prose-sm md:prose-base max-w-none
                        prose-headings:text-gray-900 prose-headings:font-medium prose-headings:tracking-tight
                        prose-p:text-gray-600 prose-p:leading-8 prose-p:mb-8
                        prose-img:my-12 prose-img:bg-gray-50
                        prose-blockquote:border-l-2 prose-blockquote:border-gray-900 prose-blockquote:py-2 prose-blockquote:pl-6 prose-blockquote:italic">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                img: ({ node, src, alt, ...props }) => {
                                    const isVideo = src?.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i);
                                    if (isVideo) {
                                        return (
                                            <video src={src} controls playsInline className="w-full my-8 bg-gray-50" />
                                        );
                                    }
                                    return (
                                        <img src={src} alt={alt} className="w-full my-8" loading="lazy" {...props} />
                                    );
                                },
                            }}
                        >
                            {post.content}
                        </ReactMarkdown>
                    </div>

                    {/* --- 4. 底部导航 --- */}
                    <div className="mt-24 pt-12 border-t border-gray-100 flex flex-col items-center gap-6">
                        <p className="text-[10px] tracking-[0.3em] text-gray-300 uppercase">End of Story</p>
                        <LocalizedClientLink
                            href="/blog"
                            className="text-[11px] font-bold tracking-[0.2em] uppercase border-b border-black pb-1 hover:text-gray-400 hover:border-gray-400 transition-all"
                        >
                            Back to Journal
                        </LocalizedClientLink>
                    </div>
                </div>
            </div>
        </article>
    )
}