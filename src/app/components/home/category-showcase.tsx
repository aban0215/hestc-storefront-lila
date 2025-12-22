import { getHomeCategorySection } from '../../../lib/strapi/home-data'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import {getSelectedLocale} from "@lib/data/locales";



export default async function CategoryShowcase() {

    const localecode = (await getSelectedLocale()) || 'en-US';

    const sectionData = await getHomeCategorySection(localecode)

    if (!sectionData || !sectionData.featuredCategories || sectionData.featuredCategories.length === 0) {
        return null
    }

    return (
        <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
                {/* 模块标题 - 从Strapi获取 */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
                        {sectionData.title}
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        {sectionData.subtitle}
                    </p>
                </div>

                {/* 品类卡片网格 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {sectionData.featuredCategories.map((category) => {
                        const imageUrl = `${process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://47.89.151.64:1337'}${category.image.url}`
                        const smallImageUrl = category.image.formats?.medium?.url
                            ? `${process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://47.89.151.64:1337'}${category.image.formats.medium.url}`
                            : imageUrl

                        return (
                            <div
                                key={category.id}
                                className="group relative overflow-hidden rounded-2xl bg-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                            >
                                {/* 品类图片 */}
                                <div className="aspect-[4/3] overflow-hidden">
                                    <LocalizedClientLink href={category.buttonLink}>
                                        <img
                                            src={imageUrl}
                                            alt={category.image.alternativeText || category.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            srcSet={`${smallImageUrl} 500w, ${imageUrl} 1000w`}
                                            loading="lazy"
                                        />
                                    </LocalizedClientLink>
                                </div>

                                {/* 品类信息 */}
                                <div className="p-6">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                        <LocalizedClientLink
                                            href={category.buttonLink}
                                            className="hover:text-pink-600 transition-colors"
                                        >
                                            {category.name}
                                        </LocalizedClientLink>
                                    </h3>

                                    <p className="text-gray-600 mb-4 line-clamp-2">
                                        {category.description}
                                    </p>

                                    <LocalizedClientLink
                                        href={category.buttonLink}
                                        className="inline-flex items-center text-pink-600 hover:text-pink-700 font-medium group/btn"
                                    >
                                        <span>{category.buttonText || '探索'}</span>
                                        <svg
                                            className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </LocalizedClientLink>
                                </div>

                                {/* 悬停装饰效果 */}
                                <div className="absolute inset-0 border-2 border-transparent group-hover:border-pink-200 rounded-2xl transition-colors pointer-events-none" />
                            </div>
                        )
                    })}
                </div>

                {/* 响应式说明 */}
                {/*<div className="lg:hidden mt-8 text-center">*/}
                {/*    <p className="text-sm text-gray-500">*/}
                {/*        Swipe to see more*/}
                {/*    </p>*/}
                {/*</div>*/}
            </div>
        </section>
    )
}