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
            {/* 1. 顶部返回区域：减少 pt (从 32 减到 24)，去掉重复嵌套 */}
            <div className="content-container pt-24 md:pt-28 pb-4">
                <BackButton />
            </div>

            {/* 2. 主体区域：pt-0 紧跟返回键，保持整体感 */}
            <main className="content-container pb-24">
                <div className="max-w-4xl mx-auto">
                    {/* 3. 标题优化：减少 mb (从 16 减到 8)，增加字间距 */}
                    <h1 className="text-[28px] md:text-[36px] font-light tracking-[0.05em] text-gray-900 mb-8 border-b border-gray-100 pb-8 uppercase">
                        {pageData.title}
                    </h1>

                    {/* 4. 正文内容 */}
                    <article className="prose prose-sm max-w-none">
                        <div className="text-gray-700 leading-[1.8] tracking-wide font-light">
                            <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                                {pageData.content}
                            </ReactMarkdown>
                        </div>
                    </article>
                </div>
            </main>
        </div>
    )}