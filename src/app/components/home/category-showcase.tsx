// src/components/home/category-showcase/index.tsx

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
        <section className="bg-white">
            {/* 1. 标题区域 - 统一风格，小字高级感 */}
            <div className="w-full pt-16 pb-10 px-4 text-center">
                <h2 className="text-[14px] md:text-[16px] font-bold text-gray-900 tracking-[0.3em] uppercase">
                    {sectionData.title || "Shop by Category"}
                </h2>
            </div>

            {/* 2. 横条展示区域 - 一行一个，全宽或近乎全宽 */}
            <div className="flex flex-col gap-[2px] bg-gray-100">
                {/* 使用 gap-[2px] 制造细微缝隙 */}
                {sectionData.featuredCategories.map((category) => {
                    const itemHref = getCategoryHref(category);
                    const media = category.image;
                    const mediaUrl = media?.url;
                    const isVideo = media?.mime?.includes('video');

                    return (
                        <LocalizedClientLink
                            key={category.id}
                            href={itemHref}
                            className="relative w-full h-[45vh] md:h-[60vh] group overflow-hidden bg-gray-200"
                        >
                            {/* 背景媒体层 */}
                            <div className="absolute inset-0">
                                {mediaUrl && (
                                    isVideo ? (
                                        <video
                                            src={mediaUrl}
                                            autoPlay muted loop playsInline
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                        />
                                    ) : (
                                        <img
                                            src={mediaUrl}
                                            alt={media.alternativeText || category.name}
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                        />
                                    )
                                )}
                                {/* 暗色遮罩层 - 确保文字清晰 */}
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-500" />
                            </div>

                            {/* 文字叠加层 - 居中设计 */}
                            <div className="relative h-full flex flex-col items-center justify-center text-white p-4">
                                <h3 className="text-[24px] md:text-[32px] font-bold tracking-[0.25em] uppercase text-center drop-shadow-sm">
                                    {category.name}
                                </h3>

                                {category.description && (
                                    <p className="mt-4 text-[12px] md:text-[14px] tracking-[0.1em] font-light max-w-[80%] text-center opacity-90">
                                        {category.description}
                                    </p>
                                )}

                                {/* 伪按钮效果 */}
                                {/*<div className="mt-8 px-6 py-2 border border-white text-[10px] tracking-[0.2em] uppercase backdrop-blur-sm transition-all group-hover:bg-white group-hover:text-black">*/}
                                {/*    Explore More*/}
                                {/*</div>*/}
                            </div>
                        </LocalizedClientLink>
                    )
                })}
            </div>
        </section>
    )
}