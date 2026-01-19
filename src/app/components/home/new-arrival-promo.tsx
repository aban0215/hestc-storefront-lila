import { getNewArrivalPromo } from '../../../lib/strapi/home-data'
import { getProductsByCollectionHandle } from '../../../lib/medusa/products'
import { getRegion } from "@lib/data/regions"
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { getSelectedLocale } from "@lib/data/locales";

export default async function NewArrivalPromo() {
    const localecode = (await getSelectedLocale()) || 'en-US';
    const newArrivalData = await getNewArrivalPromo(localecode)

    // 假设默认获取 'us' 的 region，或者从上层组件透传 countryCode
    const region = await getRegion("us")

    if (!newArrivalData || !region) return null;

    // 核心逻辑：根据 Strapi 的 handle 去 Medusa 抓货
    const collectionProducts = await getProductsByCollectionHandle(
        newArrivalData.medusaHandle || "",
        region.id,
        region.currency_code,
        8 // 抓 8 个，保证轮播够长
    )

    const getHref = () => {
        const handle = newArrivalData.medusaHandle;
        if (!handle) return "/";
        switch (newArrivalData.linkType) {
            case 'category': return `/categories/${handle}`;
            case 'collection': return `/collections/${handle}`;
            case 'product': return `/products/${handle}`;
            case 'external': return handle;
            default: return "/";
        }
    };

    const targetHref = getHref();
    const desktopMedia = newArrivalData.backgroundImage;
    const mobileMedia = newArrivalData.mobileImage || desktopMedia;
    const isDesktopVideo = desktopMedia?.mime?.includes('video');
    const isMobileVideo = mobileMedia?.mime?.includes('video');

    return (
        // 优化1：pb-12 -> pb-0，彻底消除组件底部的多余留白
        <section className="relative w-full bg-white pb-0 overflow-hidden">

            {/* 1. 标题区域 - 也可以稍微缩减 pt-16 到 pt-12 */}
            <div className="w-full pt-12 pb-8 px-10 flex flex-col items-center justify-center text-center">
                <h2 className="text-[14px] md:text-[16px] font-bold text-gray-900 tracking-[0.3em] uppercase">
                    {newArrivalData.title}
                </h2>
                {newArrivalData.subtitle && (
                    <p className="mt-2 text-[10px] text-gray-400 font-light tracking-[0.15em] uppercase">
                        {newArrivalData.subtitle}
                    </p>
                )}
            </div>

            {/* 2. 媒体展示区域 - 保持原样 */}
            <div className="group relative w-full h-[55vh] md:h-[70vh] overflow-hidden bg-gray-100">
                {/* ... 视频/图片逻辑 ... */}
                <div className="relative h-full flex items-end justify-center pb-12">
                    <LocalizedClientLink
                        href={targetHref}
                        className="inline-block px-10 py-3 border border-white text-white text-[10px] font-bold tracking-[0.2em] uppercase backdrop-blur-sm hover:bg-white hover:text-black transition-all duration-300"
                    >
                        {newArrivalData.buttonText || "Shop Collection"}
                    </LocalizedClientLink>
                </div>
            </div>

            {/* 3. 商品横向滑动 */}
            <div className="mt-1 bg-gray-100">
                <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar gap-[1px]">
                    {collectionProducts.map((product) => (
                        <LocalizedClientLink
                            key={product.handle}
                            href={`/products/${product.handle}`}
                            className="min-w-[50%] md:min-w-[25%] snap-start bg-white flex flex-col group"
                        >
                            <div className="aspect-[3/4] overflow-hidden">
                                <img
                                    src={product.thumbnail || ""}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    alt={product.title}
                                />
                            </div>
                            {/* 优化2：py-4 -> pt-3 pb-5，收紧商品信息区域 */}
                            <div className="pt-3 pb-5 px-2 text-center">
                                <h3 className="text-[10px] font-medium uppercase tracking-wider text-gray-900 truncate">{product.title}</h3>
                                <p className="text-[9px] text-gray-400 mt-1 font-light tracking-widest">{product.price}</p>
                            </div>
                        </LocalizedClientLink>
                    ))}

                    {/* View All 模块 */}
                    <LocalizedClientLink
                        href={targetHref}
                        className="min-w-[50%] md:min-w-[25%] snap-start bg-white group border-l border-gray-100 flex flex-col items-center justify-center"
                    >
                        {/* 优化3：确保这里的容器高度感知上与左侧一致 */}
                        <div className="flex flex-col items-center justify-center py-10">
                            <span className="text-[9px] tracking-[0.3em] uppercase text-gray-400 group-hover:text-black transition-colors">Explore All</span>
                            <div className="mt-2 w-8 h-[1px] bg-gray-200 group-hover:w-12 group-hover:bg-black transition-all"></div>
                        </div>
                    </LocalizedClientLink>
                </div>
            </div>
        </section>
    )
}
