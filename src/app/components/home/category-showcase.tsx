import { getHomeCategorySection } from '../../../lib/strapi/home-data'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { getSelectedLocale } from "@lib/data/locales";

export default async function CategoryShowcase() {
    const localecode = (await getSelectedLocale()) || 'en-US';
    const sectionData = await getHomeCategorySection(localecode)

    if (!sectionData || !sectionData.featuredCategories || sectionData.featuredCategories.length === 0) {
        return null
    }

    // 定义一个通用的链接生成函数
    const getCategoryHref = (category: any) => {
        const handle = category.medusaHandle;
        const type = category.linkType;
        if (!handle) return "/";
        switch (type) {
            case 'category':
                return `/categories/${handle}`;
            case 'collection':
                return `/collections/${handle}`;
            case 'product':
                return `/products/${handle}`;
            case 'external':
                return handle;
            default:
                return "/";
        }
    };


    return (
        <section className="pt-0 bg-white overflow-hidden">
            {/* 修改点：改为 flex-col (垂直) 和 items-center (居中) */}
            <div className="w-full py-6 px-10 flex flex-col items-center justify-center border-b border-gray-50 text-center">
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 leading-tight">
                    {sectionData.title}
                </h2>
                {sectionData.subtitle && (
                    <p className="mt-2 text-sm md:text-base text-gray-400 font-light tracking-widest italic uppercase">
                        {sectionData.subtitle}
                    </p>
                )}
                {/* 装饰线条（可选）：增加一点设计感 */}
                {/*<div className="mt-4 w-12 h-[1px] bg-pink-600/50" />*/}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 w-full">
                {sectionData.featuredCategories.map((category) => {
                    // ... 内部渲染逻辑保持不变
                    const itemHref = getCategoryHref(category);
                    const imageUrl = `${category.image.url}`
                    const smallImageUrl = category.image.formats?.medium?.url
                        ? `${category.image.formats.medium.url}`
                        : imageUrl

                    return (
                        <div key={category.id} className="group relative aspect-[4/5] overflow-hidden w-full">
                            <img
                                src={imageUrl}
                                alt={category.image.alternativeText || category.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                srcSet={`${smallImageUrl} 500w, ${imageUrl} 1000w`}
                                loading="lazy"
                            />

                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300"/>

                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
                                <h3 className="text-2xl md:text-3xl font-bold mb-3 tracking-wide">
                                    {category.name}
                                </h3>

                                <p className="text-sm md:text-base text-gray-100 mb-6 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 max-w-xs">
                                    {category.description}
                                </p>

                                <LocalizedClientLink
                                    href={itemHref}
                                    className="px-6 py-2 border border-white text-white hover:bg-white hover:text-black transition-all duration-300 transform"
                                >
                                    {category.buttonText || "View More"}
                                </LocalizedClientLink>
                            </div>

                            <LocalizedClientLink
                                href={itemHref}
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