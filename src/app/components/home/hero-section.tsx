import { getHomeHero } from '../../../lib/strapi/home-data'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { getSelectedLocale } from "@lib/data/locales";

export default async function HeroSection() {
    const localecode = (await getSelectedLocale()) || 'en-US';
    const heroData = await getHomeHero(localecode);
    if (!heroData) {
        return null
    }
    const getHref = () => {
        const handle = heroData.medusaHandle;
        if (!handle) return "/";

        switch (heroData.linkType) {
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
    const imageUrl = `${heroData.backgroundImage.url}`
    const smallImageUrl = heroData.backgroundImage.formats?.medium?.url
        ? `${heroData.backgroundImage.formats.medium.url}`
        : imageUrl

    return (
        /* 修改点：调整高度，手机端 60vh 左右更合适 */
        <section className="relative h-[60vh] min-h-[400px] md:h-[700px] overflow-hidden">
            {/* 背景图片 */}
            <div className="absolute inset-0">
                <img
                    src={imageUrl}
                    alt={heroData.backgroundImage.alternativeText || heroData.title}
                    /* 修改点：确保图片始终居中 */
                    className="w-full h-full object-cover object-center"
                    sizes="100vw"
                    srcSet={`${smallImageUrl} 1000w, ${imageUrl} 2000w`}
                    loading="eager"
                />

                <div
                    className="absolute inset-0 bg-black"
                    style={{opacity: (heroData.overlayOpacity || 0) / 100}}
                />
            </div>

            {/* 内容层 */}
            <div className="relative h-full flex items-center">
                <div className="container mx-auto px-4">
                    {/* 修改点：手机端文字居中 (text-center)，PC端保持靠左 (md:text-left) */}
                    <div className="max-w-2xl text-center md:text-left mx-auto md:mx-0">
                        {/* 修改点：手机端标题字号缩小 (text-3xl) */}
                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-4 leading-tight">
                            {heroData.title}
                        </h1>

                        {heroData.subtitle && (
                            /* 修改点：手机端字号缩小 (text-lg) */
                            <p className="text-lg md:text-2xl text-white/90 mb-8">
                                {heroData.subtitle}
                            </p>
                        )}

                        <LocalizedClientLink
                            href={targetHref}
                            className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-pink-600 hover:bg-pink-700 rounded-md transition-colors"
                        >
                            {heroData.buttonText}
                        </LocalizedClientLink>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/20 to-transparent"/>

            <LocalizedClientLink
                href={targetHref}
                className="absolute inset-0 z-10"
            />
        </section>
    )
}