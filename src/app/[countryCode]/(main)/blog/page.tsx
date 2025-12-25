import { getBlogPosts, getBlogCategories } from "@lib/strapi/blog-data"
import { getSelectedLocale } from "@lib/data/locales"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default async function BlogArchivePage({
                                                  params,
                                                  searchParams,
                                              }: {
    params: { countryCode: string }
    searchParams: { category?: string }
}) {
    const { countryCode } = params
    const { category: activeCategorySlug } = searchParams
    const locale = (await getSelectedLocale()) || 'en-US'

    // 并行获取分类和文章
    const [categories, posts] = await Promise.all([
        getBlogCategories(locale),
        getBlogPosts(locale, activeCategorySlug)
    ])

    // const baseUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://47.89.151.64:1337'

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
                            {posts.map((post: any) => (
                                <LocalizedClientLink
                                    key={post.id}
                                    href={`/blog/${post.slug}`}
                                    className="group flex flex-col"
                                >
                                    {/* 封面图 */}
                                    <div className="aspect-[16/10] overflow-hidden bg-gray-100 mb-4">
                                        <img
                                            src={`${post.coverImage.url}`}
                                            alt={post.coverImage.alternativeText || post.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>

                                    {/* 文章信息 */}
                                    <div className="flex items-center gap-3 mb-2 text-[10px] uppercase tracking-widest font-bold text-pink-600">
                                        <span>{post.category?.name}</span>
                                        <span className="text-gray-300">•</span>
                                        <span className="text-gray-400">{post.readTime} MIN READ</span>
                                    </div>

                                    <h2 className="text-xl font-serif font-bold mb-3 group-hover:text-pink-600 transition-colors">
                                        {post.title}
                                    </h2>

                                    <p className="text-gray-500 text-sm line-clamp-2 mb-4 leading-relaxed">
                                        {post.excerpt}
                                    </p>

                                    <span className="text-xs font-bold uppercase tracking-widest border-b border-black self-start pb-1">
                                        Read Article
                                    </span>
                                </LocalizedClientLink>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}