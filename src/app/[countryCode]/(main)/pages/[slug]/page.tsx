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
            <div className="content-container pt-32 pb-8">
                <div className="content-container pt-32 pb-8">
                    <BackButton />
                </div>
            </div>

            <main className="content-container pb-24">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-[32px] md:text-[40px] font-light tracking-tight text-gray-900 mb-16 border-b border-gray-100 pb-10">
                        {pageData.title}
                    </h1>

                    <article className="prose prose-sm max-w-none">
                        <div className="text-gray-700 leading-[1.8] tracking-wide">
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