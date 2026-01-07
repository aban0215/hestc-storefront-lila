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
            <div className="w-full py-6 px-10 flex flex-col items-center justify-center border-b border-gray-50 text-center">
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 leading-tight">
                    {sectionData.title}
                </h2>
                {sectionData.subtitle && (
                    <p className="mt-2 text-sm md:text-base text-gray-400 font-light tracking-widest italic uppercase">
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
                            <div className="mt-5 flex flex-col items-start text-left w-full">
                                <LocalizedClientLink href={itemHref} className="group">
                                    {/* 标题：从 14px 提到 18px-20px 足够了，关键是 tracking(字间距) 和 粗细 */}
                                    <h3 className="text-[18px] md:text-[20px] font-medium tracking-tight text-gray-900 group-hover:text-gray-500 transition-colors duration-300">
                                        {category.name}
                                    </h3>
                                </LocalizedClientLink>

                                {/* 描述：稍微比标题小一点，用灰色拉开层级 */}
                                {category.description && (
                                    <p className="mt-1 text-[14px] md:text-[15px] text-gray-500 font-light leading-snug line-clamp-2">
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