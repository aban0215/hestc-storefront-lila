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
            {/* 统一使用一个 main 容器，pt-24 避开 Header，pt-32 在大屏更舒展 */}
            <main className="content-container pt-24 md:pt-32 pb-24">
                <div className="max-w-4xl mx-auto">

                    {/* 1. 返回按钮：放在标题正上方，mb-8 拉开一点呼吸感 */}
                    <div className="mb-8">
                        <BackButton />
                    </div>

                    {/* 2. 标题区域：mb-12 让标题与正文有明显的层级感 */}
                    <header className="mb-12 border-b border-gray-100 pb-8">
                        <h1 className="text-[28px] md:text-[36px] font-light tracking-[0.05em] text-gray-900 uppercase">
                            {pageData.title}
                        </h1>
                    </header>

                    {/* 3. 正文内容：保持 font-light 增加高级感 */}
                    <article className="prose prose-sm max-w-none">
                        <div className="text-gray-700 leading-[1.8] tracking-[0.02em] font-light">
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