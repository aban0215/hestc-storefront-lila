import { notFound } from "next/navigation"
import { getLilaPageBySlug } from "@lib/strapi/home-data"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {getSelectedLocale} from "@lib/data/locales";
import ReactMarkdown from "react-markdown"
import rehypeRaw from "rehype-raw"
import BackButton from "@modules/account/components/back-button";

export default async function LilaDynamicPage(props: {
    params: Promise<{ countryCode: string; slug: string }>
}) {
    const { countryCode, slug } = await props.params
    const localecode = (await getSelectedLocale()) || 'en-US'
    const pageData = await getLilaPageBySlug(slug, localecode)

    if (!pageData) {
        return notFound()
    }

    // --------------------------

    return (
        <div className="bg-white min-h-screen">
            <main className="content-container pt-8 md:pt-16 pb-24">
                <div className="max-w-4xl mx-auto">
                    {/* 返回键部分保持原样 */}
                    <div className="sticky top-[60px] md:static bg-white/90 backdrop-blur-sm z-40 py-4 -mx-4 px-4 md:mx-0 md:px-0 mb-6 transition-all">
                        <BackButton />
                    </div>

                    <header className="mb-10 border-b border-gray-100 pb-6">
                        <h1 className="text-[26px] md:text-[32px] font-light tracking-[0.05em] text-gray-900 uppercase">
                            {pageData.title}
                        </h1>
                    </header>

                    {/* 2. 修改这里：直接渲染 HTML */}
                    <article className="prose prose-sm max-w-none">
                        <div
                            className="text-gray-700 leading-[1.7] tracking-[0.02em] font-light"
                            // 直接将 Strapi 的 HTML 注入到这里
                            dangerouslySetInnerHTML={{ __html: pageData.content }}
                        />
                    </article>
                </div>
            </main>
        </div>
    )

}