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
        <section className="relative h-[70vh] min-h-[500px] md:h-[700px] w-full overflow-hidden bg-gray-900">
            {/* 背景媒体容器 */}
            <div className="absolute inset-0">
                {/* 1. 移动端媒体 (仅在移动端显示) */}
                <div className="block md:hidden h-full w-full">
                    {isMobileVideo ? (
                        <video
                            src={mobileMedia.url}
                            autoPlay
                            muted
                            loop
                            playsInline
                            poster={`${mobileMedia.url}?x-oss-process=video/snapshot,t_1000,f_jpg`}
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

                {/* 2. PC 端媒体 (仅在桌面端显示) */}
                <div className="hidden md:block h-full w-full">
                    {isDesktopVideo ? (
                        <video
                            src={desktopMedia.url}
                            autoPlay
                            muted
                            loop
                            playsInline
                            poster={`${desktopMedia.url}?x-oss-process=video/snapshot,t_1000,f_jpg`}
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

                {/* 遮罩层 - 使用 Strapi 后台设置的透明度 */}
                <div
                    className="absolute inset-0 bg-black pointer-events-none"
                    style={{ opacity: (heroData.overlayOpacity || 0) / 100 }}
                />
            </div>

            {/* 内容层 */}
            <div className="relative h-full flex items-center z-20 pointer-events-none">
                <div className="container mx-auto px-6">
                    <div className="max-w-2xl text-center md:text-left mx-auto md:mx-0">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-4 leading-tight drop-shadow-lg">
                            {heroData.title}
                        </h1>

                        {heroData.subtitle && (
                            <p className="text-lg md:text-2xl text-white/90 mb-8 drop-shadow-md">
                                {heroData.subtitle}
                            </p>
                        )}

                        <div className="pointer-events-auto">
                            <LocalizedClientLink
                                href={targetHref}
                                className="inline-flex items-center justify-center px-10 py-4 text-base font-medium text-white bg-pink-600 hover:bg-pink-700 rounded-full transition-all hover:scale-105 shadow-xl"
                            >
                                {heroData.buttonText}
                            </LocalizedClientLink>
                        </div>
                    </div>
                </div>
            </div>

            {/* 底部渐变装饰 */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/40 to-transparent z-20 pointer-events-none"/>

            {/* 全屏点击热区 */}
            <LocalizedClientLink
                href={targetHref}
                className="absolute inset-0 z-10"
                aria-label={heroData.title}
            />
        </section>
    )
}