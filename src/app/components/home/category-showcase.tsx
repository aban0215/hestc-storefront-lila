import { getHomeCategorySection } from '../../../lib/strapi/home-data'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { getSelectedLocale } from "@lib/data/locales";

export default async function CategoryShowcase() {
    const localecode = (await getSelectedLocale()) || 'en-US';
    const sectionData = await getHomeCategorySection(localecode)

    if (!sectionData || !sectionData.featuredCategories || sectionData.featuredCategories.length === 0) {
        return null
    }

    return (
        <section className="pt-0 bg-white overflow-hidden">
            <div className="w-full py-8 px-10 flex flex-col md:flex-row items-baseline justify-between border-b border-gray-50">
                <h2 className="text-2xl font-serif font-bold text-gray-900 leading-none">
                    {sectionData.title}
                </h2>
                <p className="mt-2 md:mt-0 text-sm text-gray-400 font-light tracking-wider italic">
                    {sectionData.subtitle}
                </p>
            </div>

            {/* 品类平铺网格 - 关键修改：w-full 且 gap-0 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 w-full">
                {sectionData.featuredCategories.map((category) => {
                    const imageUrl = `${process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://47.89.151.64:1337'}${category.image.url}`
                    const smallImageUrl = category.image.formats?.medium?.url
                        ? `${process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://47.89.151.64:1337'}${category.image.formats.medium.url}`
                        : imageUrl

                    return (
                        <div
                            key={category.id}
                            className="group relative aspect-[4/5] overflow-hidden w-full"
                        >
                            {/* 背景图片 */}
                            <img
                                src={imageUrl}
                                alt={category.image.alternativeText || category.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                srcSet={`${smallImageUrl} 500w, ${imageUrl} 1000w`}
                                loading="lazy"
                            />

                            {/* 覆盖层 - 默认半透明渐变，悬停时加深 */}
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300" />

                            {/* 内容叠加在图片上 */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
                                <h3 className="text-2xl md:text-3xl font-bold mb-3 tracking-wide">
                                    {category.name}
                                </h3>

                                <p className="text-sm md:text-base text-gray-100 mb-6 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 max-w-xs">
                                    {category.description}
                                </p>

                                <LocalizedClientLink
                                    href={category.buttonLink}
                                    className="px-6 py-2 border border-white text-white hover:bg-white hover:text-black transition-all duration-300 transform"
                                >
                                    {category.buttonText || '探索'}
                                </LocalizedClientLink>
                            </div>

                            {/* 整个区域点击跳转 */}
                            <LocalizedClientLink
                                href={category.buttonLink}
                                className="absolute inset-0 z-10"
                                aria-label={category.name}
                            />
                        </div>
                    )
                })}
            </div>
        </section>
    )
}