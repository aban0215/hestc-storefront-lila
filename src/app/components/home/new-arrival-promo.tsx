// app/components/home/new-arrival-promo.tsx
import { getNewArrivalPromo } from '../../../lib/strapi/home-data'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import {getSelectedLocale} from "@lib/data/locales";

export default async function NewArrivalPromo() {

    const localecode = (await getSelectedLocale()) || 'en-US';

    const newArrivalData = await getNewArrivalPromo(localecode)

    if (!newArrivalData) {
        return null
    }

    // 构建图片URL
    const imageUrl = `${process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://47.89.151.64:1337'}${newArrivalData.backgroundImage.url}`
    const smallImageUrl = newArrivalData.backgroundImage.formats?.medium?.url
        ? `${process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://47.89.151.64:1337'}${newArrivalData.backgroundImage.formats.medium.url}`
        : imageUrl

    return (
        <section className="py-16 bg-gradient-to-b from-white to-gray-50">
            <div className="container mx-auto px-4">
                <div className="relative overflow-hidden rounded-3xl bg-gray-900">
                    {/* 背景图片 */}
                    <div className="absolute inset-0">
                        <img
                            src={imageUrl}
                            alt={newArrivalData.backgroundImage.alternativeText || newArrivalData.title}
                            className="w-full h-full object-cover opacity-60"
                            sizes="100vw"
                            srcSet={`${smallImageUrl} 1000w, ${imageUrl} 2000w`}
                            loading="lazy"
                        />

                        {/* 渐变遮罩 */}
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-gray-900/60 to-transparent" />
                    </div>

                    {/* 内容 */}
                    <div className="relative">
                        <div className="max-w-2xl p-8 md:p-12 lg:p-16">
                            {/* 副标题 */}
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm mb-4">
                <span className="text-sm font-medium text-white">
                  {newArrivalData.subtitle}
                </span>
                            </div>

                            {/* 主标题 */}
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white mb-4">
                                {newArrivalData.title}
                            </h2>

                            {/* 描述 - 保持换行 */}
                            <div className="prose prose-lg prose-invert mb-6">
                                {newArrivalData.description.split('\n').map((line, index) => (
                                    <p key={index} className="text-gray-200 mb-3">
                                        {line}
                                    </p>
                                ))}
                            </div>

                            {/* 按钮 */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <LocalizedClientLink
                                    href={newArrivalData.buttonLink}
                                    className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-gray-900 bg-white hover:bg-gray-100 rounded-md transition-colors"
                                >
                                    {newArrivalData.buttonText}
                                </LocalizedClientLink>

                                {/*<LocalizedClientLink*/}
                                {/*    href="/store?sort=newest"*/}
                                {/*    className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white border-2 border-white/30 hover:border-white rounded-md transition-colors"*/}
                                {/*>*/}
                                {/*    浏览所有新品*/}
                                {/*</LocalizedClientLink>*/}
                            </div>

                            {/* 装饰性标签 */}
                            <div className="mt-8 flex flex-wrap gap-3">
                {/*<span className="px-3 py-1 text-sm font-medium text-white bg-pink-600/30 rounded-full">*/}
                {/*  新品上市*/}
                {/*</span>*/}
                {/*                <span className="px-3 py-1 text-sm font-medium text-white bg-blue-600/30 rounded-full">*/}
                {/*  限时优惠*/}
                {/*</span>*/}
                {/*                <span className="px-3 py-1 text-sm font-medium text-white bg-purple-600/30 rounded-full">*/}
                {/*  独家设计*/}
                {/*</span>*/}
                            </div>
                        </div>
                    </div>

                    {/* 装饰性角标 */}
                    <div className="absolute top-0 right-0 w-32 h-32">
                        <div className="absolute top-8 -right-8 w-40 h-40 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full blur-3xl" />
                    </div>
                </div>
            </div>
        </section>
    )
}