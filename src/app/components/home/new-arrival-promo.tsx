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
        <section className="relative w-full bg-white pb-20 overflow-hidden">
            {/* 1. 标题区域：保持你的精致排版，调小字号对齐大牌感 */}
            <div className="w-full pt-16 pb-8 px-10 flex flex-col items-center justify-center text-center">
                <h2 className="text-[14px] md:text-[16px] font-bold text-gray-900 tracking-[0.3em] uppercase">
                    {newArrivalData.title}
                </h2>
                {newArrivalData.subtitle && (
                    <p className="mt-2 text-[10px] text-gray-400 font-light tracking-[0.15em] uppercase">
                        {newArrivalData.subtitle}
                    </p>
                )}
            </div>

            {/* 2. 媒体展示区域：高度压到 50vh-60vh，保留你的视频逻辑 */}
            <div className="group relative w-full h-[50vh] md:h-[65vh] overflow-hidden bg-gray-100">
                <div className="absolute inset-0">
                    {/* 手机端媒体 */}
                    <div className="block md:hidden h-full w-full">
                        {isMobileVideo ? (
                            <video src={mobileMedia.url} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                        ) : (
                            <img src={mobileMedia.url} alt={newArrivalData.title} className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105" />
                        )}
                    </div>
                    {/* PC 端媒体 */}
                    <div className="hidden md:block h-full w-full">
                        {isDesktopVideo ? (
                            <video src={desktopMedia.url} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                        ) : (
                            <img src={desktopMedia.url} alt={newArrivalData.title} className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105" />
                        )}
                    </div>
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors duration-500" />
                </div>

                {/* 内容层：保留你的 Description 和按钮 */}
                <div className="relative h-full flex items-center justify-center">
                    <div className="max-w-3xl px-6 text-center text-white">
                        <div className="hidden md:block text-white text-sm mb-8 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-700 ease-out font-light tracking-widest">
                            {newArrivalData.description}
                        </div>
                        <LocalizedClientLink
                            href={targetHref}
                            className="inline-block px-10 py-3 border border-white text-white text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-white hover:text-black transition-all duration-300"
                        >
                            {newArrivalData.buttonText || "Discover Collection"}
                        </LocalizedClientLink>
                    </div>
                </div>
            </div>

            {/* 3. 核心：商品横向滑动轮播 - 采用“压屏”设计 */}
            <div className="mt-[-60px] md:mt-[-80px] relative z-30">
                <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar px-6 gap-4">
                    {collectionProducts.map((product) => (
                        <LocalizedClientLink
                            key={product.handle}
                            href={`/products/${product.handle}`}
                            className="min-w-[60%] md:min-w-[22%] snap-start bg-white p-2 shadow-xl flex flex-col group"
                        >
                            <div className="aspect-[3/4] overflow-hidden bg-gray-50">
                                <img
                                    src={product.thumbnail || ""}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    alt={product.title}
                                />
                            </div>
                            <div className="mt-4 px-1 pb-2">
                                <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-900 truncate">{product.title}</h3>
                                <p className="text-[9px] text-gray-400 mt-1 font-light tracking-widest">{product.price}</p>
                            </div>
                        </LocalizedClientLink>
                    ))}

                    {/* 最后的“查看全部”引导 */}
                    <LocalizedClientLink
                        href={targetHref}
                        className="min-w-[40%] md:min-w-[15%] snap-start aspect-[3/4] flex flex-col items-center justify-center border border-dashed border-gray-200 bg-gray-50/50 hover:bg-black group transition-all"
                    >
                        <span className="text-[9px] tracking-[0.3em] uppercase group-hover:text-white">Full Series</span>
                    </LocalizedClientLink>
                </div>
            </div>
        </section>
    )
}