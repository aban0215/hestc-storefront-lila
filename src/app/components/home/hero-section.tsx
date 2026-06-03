import { getHomeHero } from '../../../lib/strapi/home-data'
import { getSelectedLocale } from "@lib/data/locales"
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import HeroContent from './hero-content'

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
        <section className="relative w-full overflow-hidden bg-gray-900 h-screen">
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
                            fetchPriority="high"
                            loading="eager"
                            decoding="sync"
                            className="absolute inset-0 w-full h-full object-cover"
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
                            fetchPriority="high"
                            loading="eager"
                            decoding="sync"
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    )}
                </div>

                {/* 遮罩层 */}
                <div
                    className="absolute inset-0 bg-black pointer-events-none"
                    style={{ opacity: (heroData.overlayOpacity || 0) }}
                />
            </div>

            <HeroContent
                title={heroData.title}
                subtitle={heroData.subtitle}
                buttonText={heroData.buttonText}
                targetHref={targetHref}
            />

            {/* 底部渐变装饰 */}
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