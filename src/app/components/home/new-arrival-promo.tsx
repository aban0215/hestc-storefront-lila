// app/components/home/new-arrival-promo.tsx
import { getNewArrivalPromo } from '../../../lib/strapi/home-data'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { getSelectedLocale } from "@lib/data/locales";

export default async function NewArrivalPromo() {
    const localecode = (await getSelectedLocale()) || 'en-US';
    const newArrivalData = await getNewArrivalPromo(localecode)

    if (!newArrivalData) {
        return null
    }

    const getHref = () => {
        const handle = newArrivalData.medusaHandle;
        if (!handle) return "/";

        switch (newArrivalData.linkType) {
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

    const targetHref = getHref();

    // 背景图逻辑
    const desktopImageUrl = `${newArrivalData.backgroundImage.url}`;
    const mobileImageUrl = newArrivalData.mobileImage?.url
        ? `${newArrivalData.mobileImage.url}`
        : desktopImageUrl;

    const smallImageUrl = newArrivalData.backgroundImage.formats?.medium?.url
        ? `${newArrivalData.backgroundImage.formats.medium.url}`
        : desktopImageUrl;

    return (
        <section className="relative w-full overflow-hidden bg-white">

            {/* 1. 标题区域：压缩间距并保持居中 */}
            <div className="w-full py-8 md:py-14 px-10 flex flex-col items-center justify-center text-center border-t border-gray-50">
                <h2 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 tracking-tight leading-tight">
                    {newArrivalData.title}
                </h2>
                {newArrivalData.subtitle && (
                    <p className="mt-3 md:mt-4 text-sm md:text-base text-gray-400 font-light tracking-[0.3em] italic uppercase">
                        {newArrivalData.subtitle}
                    </p>
                )}
                <div className="mt-5 w-16 h-[1px] bg-pink-600/40" />
            </div>

            {/* 2. 图片展示区域：带 Group Hover 状态 */}
            <div className="group relative w-full h-[65vh] md:h-[75vh] min-h-[500px]">
                <div className="absolute inset-0">
                    <picture>
                        <source media="(max-width: 767px)" srcSet={mobileImageUrl} />
                        <img
                            src={desktopImageUrl}
                            alt={newArrivalData.backgroundImage.alternativeText || newArrivalData.title}
                            className="w-full h-full object-cover transition-transform duration-[2000ms] ease-out group-hover:scale-110"
                            sizes="100vw"
                            srcSet={`${smallImageUrl} 800w, ${desktopImageUrl} 1600w`}
                            loading="lazy"
                        />
                    </picture>
                    {/* 遮罩颜色加深动效 */}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />
                </div>

                {/* 3. 内容层：对标 CategoryShowcase 的悬停升起效果 */}
                <div className="relative h-full flex items-center justify-center">
                    <div className="max-w-3xl px-6 text-center text-white">

                        {/* 描述文本：初始透明并下移，Hover 后升起 (与 Category 一致) */}
                        <div className="text-white text-lg md:text-xl mb-10 max-w-2xl mx-auto space-y-3 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-700 ease-out drop-shadow-md font-light tracking-wide">
                            {newArrivalData.description.split('\n').map((line, index) => (
                                <p key={index}>{line}</p>
                            ))}
                        </div>

                        {/* 按钮：悬停缩放效果 */}
                        <div className="flex justify-center">
                            <LocalizedClientLink
                                href={targetHref}
                                className="px-12 py-4 border border-white text-white text-sm font-bold tracking-[0.2em] uppercase hover:bg-white hover:text-black transition-all duration-300 transform"
                            >
                                {newArrivalData.buttonText}
                            </LocalizedClientLink>
                        </div>
                    </div>
                </div>

                {/* 全区域点击热区 */}
                <LocalizedClientLink
                    href={targetHref}
                    className="absolute inset-0 z-10"
                    aria-label={newArrivalData.title}
                />
            </div>
        </section>
    )
}