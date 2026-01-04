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
            case 'category': return `/categories/${handle}`;
            case 'collection': return `/collections/${handle}`;
            case 'product': return `/products/${handle}`;
            case 'external': return handle;
            default: return "/";
        }
    };

    const targetHref = getHref();

    // 媒体逻辑处理
    const desktopMedia = newArrivalData.backgroundImage;
    const mobileMedia = newArrivalData.mobileImage || desktopMedia;

    const isDesktopVideo = desktopMedia?.mime?.includes('video');
    const isMobileVideo = mobileMedia?.mime?.includes('video');

    return (
        <section className="relative w-full overflow-hidden bg-white">
            {/* 1. 标题区域 */}
            <div className="w-full py-6 px-10 flex flex-col items-center justify-center border-b border-gray-50 text-center">
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 leading-tight">
                    {newArrivalData.title}
                </h2>
                {newArrivalData.subtitle && (
                    <p className="mt-2 text-sm md:text-base text-gray-400 font-light tracking-widest italic uppercase">
                        {newArrivalData.subtitle}
                    </p>
                )}
            </div>

            {/* 2. 媒体展示区域：带 Group Hover 状态 */}
            <div className="group relative w-full h-[65vh] md:h-[75vh] min-h-[500px] overflow-hidden bg-gray-100">
                <div className="absolute inset-0">
                    {/* 手机端媒体 */}
                    <div className="block md:hidden h-full w-full">
                        {isMobileVideo ? (
                            <video
                                src={mobileMedia.url}
                                autoPlay
                                muted
                                loop
                                playsInline
                                poster={`${mobileMedia.url}?x-oss-process=video/snapshot,t_1000,f_jpg`}
                                className="w-full h-full object-cover transition-transform duration-[2000ms] ease-out group-hover:scale-110"
                            />
                        ) : (
                            <img
                                src={mobileMedia.url}
                                alt={mobileMedia.alternativeText || newArrivalData.title}
                                className="w-full h-full object-cover transition-transform duration-[2000ms] ease-out group-hover:scale-110"
                            />
                        )}
                    </div>

                    {/* PC 端媒体 */}
                    <div className="hidden md:block h-full w-full">
                        {isDesktopVideo ? (
                            <video
                                src={desktopMedia.url}
                                autoPlay
                                muted
                                loop
                                playsInline
                                poster={`${desktopMedia.url}?x-oss-process=video/snapshot,t_1000,f_jpg`}
                                className="w-full h-full object-cover transition-transform duration-[2000ms] ease-out group-hover:scale-110"
                            />
                        ) : (
                            <img
                                src={desktopMedia.url}
                                alt={desktopMedia.alternativeText || newArrivalData.title}
                                className="w-full h-full object-cover transition-transform duration-[2000ms] ease-out group-hover:scale-110"
                                loading="lazy"
                            />
                        )}
                    </div>

                    {/* 遮罩层：增加半透明黑色遮罩确保文字可读性 */}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />
                </div>

                {/* 3. 内容层 */}
                <div className="relative h-full flex items-center justify-center pointer-events-none">
                    <div className="max-w-3xl px-6 text-center text-white">
                        {/* 描述文本：Hover 后升起 */}
                        <div className="text-white text-lg md:text-xl mb-10 max-w-2xl mx-auto space-y-3 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-700 ease-out drop-shadow-md font-light tracking-wide">
                            {newArrivalData.description?.split('\n').map((line: string, index: number) => (
                                <p key={index}>{line}</p>
                            ))}
                        </div>

                        {/* 按钮 */}
                        <div className="flex justify-center pointer-events-auto">
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