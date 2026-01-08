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

    console.log('localecodesss' + localecode);

    const pageData = await getLilaPageBySlug(slug, localecode)

    if (!pageData) {
        return notFound()
    }

    return (
        <div className="bg-white min-h-screen">
            {/* 1. 将 pt-24/32 缩减一半到 pt-12/16，紧贴导航栏下边缘 */}
            <main className="content-container pt-12 md:pt-16 pb-24">
                <div className="max-w-4xl mx-auto">

                    {/* 2. 返回按钮：mb-6 稍微收紧，让它离标题更近一点 */}
                    <div className="mb-6">
                        <BackButton />
                    </div>

                    {/* 3. 标题区域：mb-10 缩短与正文的距离 */}
                    <header className="mb-10 border-b border-gray-100 pb-6">
                        <h1 className="text-[26px] md:text-[32px] font-light tracking-[0.05em] text-gray-900 uppercase">
                            {pageData.title}
                        </h1>
                    </header>

                    {/* 4. 正文内容 */}
                    <article className="prose prose-sm max-w-none">
                        <div className="text-gray-700 leading-[1.7] tracking-[0.02em] font-light">
                            <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                                {pageData.content}
                            </ReactMarkdown>
                        </div>
                    </article>
                </div>
            </main>
        </div>
    )

}