import { getBlogPostBySlug } from "@lib/strapi/blog-data"
import { getSelectedLocale } from "@lib/data/locales"
import { notFound } from "next/navigation"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ChevronLeft } from "lucide-react" // 假设你使用了 lucide-react

export default async function BlogDetailPage({
                                                 params
                                             }: {
    params: Promise<{ slug: string, countryCode: string }> // 修改为 Promise 类型
}) {
    // 关键修复：在使用 slug 之前必须先 await params
    const resolvedParams = await params
    const { slug } = resolvedParams

    const locale = (await getSelectedLocale()) || 'en-US'
    console.log("slugslugslug" + slug)
    // 1. 获取数据
    // 注意：如果你的 Strapi 里的 slug 是 "/yogaposttitle"，
    // 而 URL 传过来的是 "yogaposttitle"，记得在这里补上斜杠进行匹配
    const post = await getBlogPostBySlug(slug, locale)
    console.log("slugslugslug" + post)

    if (!post) {
        // 如果还是 404，请检查 getBlogPostBySlug 里的查询逻辑是否匹配了 "/"
        notFound()
    }

    const baseUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://47.89.151.64:1337'
    const fullImageUrl = post.coverImage.url ? `${baseUrl}${post.coverImage.url}` : null

    return (
        <article className="min-h-screen bg-white">
            {/* --- 顶部导航/面包屑 --- */}
            {/*<nav className="container mx-auto px-4 py-6">*/}
            {/*    <LocalizedClientLink*/}
            {/*        href="/blog"*/}
            {/*        className="inline-flex items-center text-sm text-gray-500 hover:text-black transition-colors group"*/}
            {/*    >*/}
            {/*        <ChevronLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" />*/}
            {/*        Back to Blog*/}
            {/*    </LocalizedClientLink>*/}
            {/*</nav>*/}

            {/* --- Hero 头部区域 --- */}
            <header className="container mx-auto px-4 mb-12">
                <div className="max-w-4xl mx-auto text-center mb-10">
                    {/*{post.category && (*/}
                    {/*    <span className="inline-block px-3 py-1 border border-pink-600 text-pink-600 text-xs font-bold tracking-widest uppercase mb-4">*/}
                    {/*        {post.category.name}*/}
                    {/*    </span>*/}
                    {/*)}*/}
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
                    {/* 使用 ReactMarkdown 解析内容 */}
                    <div className="prose prose-lg prose-pink max-w-none
                        prose-headings:font-serif prose-headings:font-bold
                        prose-p:text-gray-700 prose-p:leading-relaxed
                        prose-img:rounded-md prose-blockquote:italic prose-blockquote:text-pink-600">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {post.content}
                        </ReactMarkdown>
                    </div>

                    {/* --- 底部装饰/分享 --- */}
                    <div className="mt-16 pt-8 border-t border-gray-100 flex justify-between items-center">
                        <div className="flex gap-4">
                            {/* 这里可以放社交分享按钮 */}
                        </div>
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