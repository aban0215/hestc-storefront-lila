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

    // 获取 PC 端和手机端图片地址
    const desktopImageUrl = heroData.backgroundImage.url;
    // mobileImage
    const mobileImageUrl = heroData.mobileImage?.url || desktopImageUrl;

    return (
        <section className="relative h-[70vh] min-h-[500px] md:h-[700px] w-full overflow-hidden">
            {/* 背景图片容器 */}
            <div className="absolute inset-0">
                <picture>
                    {/* 当屏幕宽度小于 768px 时，显示手机端专用图 */}
                    <source
                        media="(max-width: 767px)"
                        srcSet={mobileImageUrl}
                    />
                    {/* 当屏幕宽度大于等于 768px 时，显示 PC 端图 */}
                    <img
                        src={desktopImageUrl}
                        alt={heroData.backgroundImage.alternativeText || heroData.title}
                        className="w-full h-full object-cover object-center"
                        loading="eager"
                    />
                </picture>

                {/* 遮罩层 */}
                <div
                    className="absolute inset-0 bg-black"
                    style={{ opacity: (heroData.overlayOpacity || 0) / 100 }}
                />
            </div>

            {/* 内容层 - 优化了移动端的排版 */}
            <div className="relative h-full flex items-center">
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

                        <LocalizedClientLink
                            href={targetHref}
                            className="inline-flex items-center justify-center px-10 py-4 text-base font-medium text-white bg-pink-600 hover:bg-pink-700 rounded-full transition-all hover:scale-105"
                        >
                            {heroData.buttonText}
                        </LocalizedClientLink>
                    </div>
                </div>
            </div>

            {/* 底部渐变装饰 */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/40 to-transparent"/>

            {/* 全屏点击热区 */}
            <LocalizedClientLink
                href={targetHref}
                className="absolute inset-0 z-10"
            />
        </section>
    )
}