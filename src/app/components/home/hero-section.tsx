import { getHomeHero } from '../../../lib/strapi/home-data'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { getSelectedLocale } from "@lib/data/locales";

export default async function HeroSection() {
    const localecode = (await getSelectedLocale()) || 'en-US';
    const heroData = await getHomeHero(localecode);

    if (!heroData) return null;

    const getHref = () => {
        const handle = heroData.medusaHandle;
        if (!handle) return "/";
        switch (heroData.linkType) {
            case 'category': return `/categories/${handle}`;
            case 'collection': return `/collections/${handle}`;
            case 'product': return `/products/${handle}`;
            case 'external': return handle;
            default: return "/";
        }
    };

    const targetHref = getHref();

    // 媒体处理
    const desktopMedia = heroData.backgroundImage;
    const mobileMedia = heroData.mobileImage || desktopMedia;

    const isDesktopVideo = desktopMedia?.mime?.includes('video');
    const isMobileVideo = mobileMedia?.mime?.includes('video');

    return (
        <section className="relative w-full overflow-hidden bg-gray-900 aspect-[16/9] min-h-[600px]">
            {/* 背景媒体容器 */}
            <div className="absolute inset-0">
                {/* 1. 移动端媒体 */}
                <div className="block md:hidden w-full h-full">
                    {isMobileVideo ? (
                        <video
                            src={mobileMedia.url}
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <img
                            src={mobileMedia.url}
                            alt={mobileMedia.alternativeText || heroData.title}
                            className="w-full h-full object-cover"
                            loading="eager"
                        />
                    )}
                </div>

                {/* 2. PC 端媒体 */}
                <div className="hidden md:block w-full h-full">
                    {isDesktopVideo ? (
                        <video
                            src={desktopMedia.url}
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <img
                            src={desktopMedia.url}
                            alt={desktopMedia.alternativeText || heroData.title}
                            className="w-full h-full object-cover"
                            loading="eager"
                        />
                    )}
                </div>

                {/* 遮罩层 */}
                <div
                    className="absolute inset-0 bg-black pointer-events-none"
                    style={{ opacity: (heroData.overlayOpacity || 0) / 100 }}
                />
            </div>

            {/* 内容层 - 调整为 flex-end (靠下) 和 text-center (水平居中) */}
            <div className="relative w-full h-full flex items-end justify-center z-20 pointer-events-none pb-16 md:pb-24">
                <div className="container mx-auto px-6">
                    <div className="max-w-3xl text-center mx-auto">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-4 leading-tight drop-shadow-2xl">
                            {heroData.title}
                        </h1>

                        {heroData.subtitle && (
                            <p className="text-lg md:text-xl text-white/90 mb-8 drop-shadow-lg max-w-xl mx-auto">
                                {heroData.subtitle}
                            </p>
                        )}

                        <div className="pointer-events-auto">
                            <LocalizedClientLink
                                href={targetHref}
                                // 按钮改为白色背景 bg-white，黑色文字 text-black
                                className="inline-flex items-center justify-center px-10 py-3.5 text-base font-semibold text-black bg-white hover:bg-gray-100 rounded-full transition-all hover:scale-105 shadow-2xl"
                            >
                                {heroData.buttonText}
                            </LocalizedClientLink>
                        </div>
                    </div>
                </div>
            </div>

            {/* 底部渐变装饰 - 增强文字可读性 */}
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent z-10 pointer-events-none"/>

            {/* 全屏点击热区 */}
            <LocalizedClientLink
                href={targetHref}
                className="absolute inset-0 z-10"
                aria-label={heroData.title}
            />
        </section>
    )
}