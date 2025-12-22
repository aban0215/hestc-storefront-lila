import { getHomeHero } from '../../../lib/strapi/home-data'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import {getSelectedLocale} from "@lib/data/locales";

export default async function HeroSection() {

    const localecode = (await getSelectedLocale()) || 'en-US';

    const heroData = await getHomeHero(localecode);

    if (!heroData) {
        return null
    }

    // 构建图片URL
    const imageUrl = `${process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://47.89.151.64:1337'}${heroData.backgroundImage.url}`

    // 如果有小尺寸格式，可以使用
    const smallImageUrl = heroData.backgroundImage.formats?.medium?.url
        ? `${process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://47.89.151.64:1337'}${heroData.backgroundImage.formats.medium.url}`
        : imageUrl

    return (
        <section className="relative h-[600px] md:h-[700px] overflow-hidden">
            {/* 背景图片 */}
            <div className="absolute inset-0">
                <img
                    src={imageUrl}
                    alt={heroData.backgroundImage.alternativeText || heroData.title}
                    className="w-full h-full object-cover"
                    sizes="100vw"
                    srcSet={`${smallImageUrl} 1000w, ${imageUrl} 2000w`}
                    loading="eager"
                />

                {/* 遮罩层 - 使用overlayOpacity控制透明度 */}
                <div
                    className="absolute inset-0 bg-black"
                    style={{ opacity: (heroData.overlayOpacity || 0) / 100 }}
                />
            </div>

            {/* 内容层 */}
            <div className="relative h-full flex items-center">
                <div className="container mx-auto px-4">
                    <div className="max-w-2xl">
                        {/* 主标题 */}
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-4 leading-tight">
                            {heroData.title}
                        </h1>

                        {/* 副标题 */}
                        {heroData.subtitle && (
                            <p className="text-xl md:text-2xl text-white/90 mb-8">
                                {heroData.subtitle}
                            </p>
                        )}

                        {/* 按钮 */}
                        <LocalizedClientLink
                            href={heroData.buttonLink}
                            className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-pink-600 hover:bg-pink-700 rounded-md transition-colors"
                        >
                            {heroData.buttonText}
                        </LocalizedClientLink>
                    </div>
                </div>
            </div>

            {/* 装饰性元素 - 可选 */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/20 to-transparent" />
        </section>
    )
}