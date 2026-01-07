import { getHomeCategorySection } from '../../../lib/strapi/home-data'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { getSelectedLocale } from "@lib/data/locales";

export default async function CategoryShowcase() {
    const localecode = (await getSelectedLocale()) || 'en-US';
    const sectionData = await getHomeCategorySection(localecode)

    if (!sectionData || !sectionData.featuredCategories || sectionData.featuredCategories.length === 0) {
        return null
    }

    const getCategoryHref = (category: any) => {
        const handle = category.medusaHandle;
        const type = category.linkType;
        if (!handle) return "/";
        switch (type) {
            case 'category': return `/categories/${handle}`;
            case 'collection': return `/collections/${handle}`;
            case 'product': return `/products/${handle}`;
            case 'external': return handle;
            default: return "/";
        }
    };

    return (
        <section className="py-12 bg-white overflow-hidden">
            {/* 标题区域 - 极简风 */}
            <div className="w-full pb-10 px-6 flex flex-col items-center justify-center text-center">
                <h2 className="text-xl md:text-2xl font-light text-gray-900 tracking-[0.2em] uppercase">
                    {sectionData.title}
                </h2>
                {sectionData.subtitle && (
                    <p className="mt-4 text-[10px] md:text-xs text-gray-400 font-light tracking-[0.3em] uppercase">
                        {sectionData.subtitle}
                    </p>
                )}
            </div>

            {/* 网格展示区域 - 一行4个 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-4 px-4 md:px-10 w-full">
                {sectionData.featuredCategories.map((category) => {
                    const itemHref = getCategoryHref(category);
                    const media = category.image;
                    const mediaUrl = media?.url;
                    const isVideo = media?.mime?.includes('video');

                    return (
                        <div key={category.id} className="group flex flex-col items-center w-full">
                            {/* 媒体容器 */}
                            <LocalizedClientLink
                                href={itemHref}
                                className="relative aspect-[3/4] overflow-hidden w-full bg-[#f6f6f6]"
                            >
                                <div className="absolute inset-0">
                                    {mediaUrl && (
                                        isVideo ? (
                                            <video
                                                src={mediaUrl}
                                                autoPlay
                                                muted
                                                loop
                                                playsInline
                                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                            />
                                        ) : (
                                            <img
                                                src={mediaUrl}
                                                alt={media.alternativeText || category.name}
                                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                                loading="lazy"
                                            />
                                        )
                                    )}
                                </div>
                            </LocalizedClientLink>

                            {/* 文字区域 - 放在图片下方 */}
                            <div className="mt-6 flex flex-col items-center text-center px-2">
                                <LocalizedClientLink href={itemHref}>
                                    <h3 className="text-[12px] md:text-sm font-normal tracking-[0.1em] text-gray-800 hover:text-gray-500 transition-colors duration-300">
                                        {category.name}
                                    </h3>
                                </LocalizedClientLink>

                                {/* 如果有描述，可以极小字显示，或者保持纯净只留标题 */}
                                {category.description && (
                                    <p className="mt-2 text-[10px] text-gray-400 font-light line-clamp-1">
                                        {category.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </section>
    )
}