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
            {/* 1. 标题区域 */}
            <div className="w-full pt-4 pb-10 px-4 text-center">
                <h2 className="text-[14px] md:text-[16px] font-bold text-gray-900 tracking-[0.3em] uppercase">
                    {sectionData.title || "Shop by Category"}
                </h2>
            </div>

            {/* 2. 展示区域：移动端 1 列，PC 端 2 列 */}
            {/* 修改点：使用 grid 布局，gap-[2px] 保持精致分割线 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[2px] bg-gray-100 border-y border-gray-100">
                {sectionData.featuredCategories.map((category) => {
                    const itemHref = getCategoryHref(category);
                    const media = category.image;
                    const mediaUrl = media?.url;
                    const isVideo = media?.mime?.includes('video');

                    return (
                        <LocalizedClientLink
                            key={category.id}
                            href={itemHref}
                            // 修改点：PC 端高度稍微压低一点（50vh），防止并排时占满整个首屏
                            className="relative w-full h-[45vh] md:h-[50vh] group overflow-hidden bg-gray-200"
                        >
                            {/* 背景媒体层 */}
                            <div className="absolute inset-0">
                                {mediaUrl && (
                                    isVideo ? (
                                        <video
                                            src={mediaUrl}
                                            autoPlay muted loop playsInline
                                            className="w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-110"
                                        />
                                    ) : (
                                        <img
                                            src={mediaUrl}
                                            alt={media.alternativeText || category.name}
                                            className="w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-110"
                                        />
                                    )
                                )}
                                {/* 遮罩层：PC 端悬浮时稍微加深，增加沉浸感 */}
                                <div className="absolute inset-0 bg-black/25 group-hover:bg-black/40 transition-colors duration-500" />
                            </div>

                            {/* 文字叠加层 */}
                            <div className="relative h-full flex flex-col items-center justify-center text-white p-8 text-center">
                                {/* 装饰小字（可选，增加大牌感） */}
                                <span className="text-[10px] tracking-[0.4em] uppercase mb-3 opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-4 group-hover:translate-y-0">
                                    Discover
                                </span>

                                <h3 className="text-[22px] md:text-[28px] font-bold tracking-[0.2em] uppercase drop-shadow-md transition-transform duration-700 group-hover:-translate-y-2">
                                    {category.name}
                                </h3>

                                {category.description && (
                                    <p className="mt-4 text-[11px] md:text-[12px] tracking-[0.1em] font-light max-w-[85%] opacity-80 line-clamp-2">
                                        {category.description}
                                    </p>
                                )}

                                {/* 底部装饰线 */}
                                <div className="mt-6 w-0 h-[1px] bg-white transition-all duration-700 group-hover:w-12"></div>
                            </div>
                        </LocalizedClientLink>
                    )
                })}
            </div>
        </section>
    )
}