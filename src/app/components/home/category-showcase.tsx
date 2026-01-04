import { getHomeCategorySection } from '../../../lib/strapi/home-data'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { getSelectedLocale } from "@lib/data/locales";

export default async function CategoryShowcase() {
    const localecode = (await getSelectedLocale()) || 'en-US';
    const sectionData = await getHomeCategorySection(localecode)

    if (!sectionData || !sectionData.featuredCategories || sectionData.featuredCategories.length === 0) {
        return null
    }

    // 通用链接生成函数
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
        <section className="pt-0 bg-white overflow-hidden">
            {/* 标题区域 */}
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

            {/* 网格展示区域 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 w-full">
                {sectionData.featuredCategories.map((category) => {
                    const itemHref = getCategoryHref(category);
                    const media = category.image; // 对应后端图片/视频字段
                    const mediaUrl = media?.url;
                    const isVideo = media?.mime?.includes('video');

                    return (
                        <div key={category.id} className="group relative aspect-[4/5] overflow-hidden w-full bg-gray-100">
                            {/* 媒体层 */}
                            <div className="absolute inset-0">
                                {mediaUrl && (
                                    isVideo ? (
                                        <video
                                            src={mediaUrl}
                                            autoPlay
                                            muted
                                            loop
                                            playsInline
                                            poster={`${mediaUrl}?x-oss-process=video/snapshot,t_1000,f_jpg`}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    ) : (
                                        <img
                                            src={mediaUrl}
                                            alt={media.alternativeText || category.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            loading="lazy"
                                        />
                                    )
                                )}
                            </div>

                            {/* 遮罩层 */}
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300"/>

                            {/* 内容层 - pointer-events-none 防止干扰下方的全屏链接 */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center pointer-events-none">
                                <h3 className="text-2xl md:text-3xl font-bold mb-3 tracking-wide drop-shadow-md">
                                    {category.name}
                                </h3>

                                <p className="text-sm md:text-base text-gray-100 mb-6 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 max-w-xs line-clamp-3">
                                    {category.description}
                                </p>

                                <div className="pointer-events-auto">
                                    <div className="px-6 py-2 border border-white text-white group-hover:bg-white group-hover:text-black transition-all duration-300">
                                        {category.buttonText || "View More"}
                                    </div>
                                </div>
                            </div>

                            {/* 全区域点击热区 */}
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