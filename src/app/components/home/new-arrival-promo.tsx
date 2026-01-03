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

    // 背景图逻辑：优先获取你新加的 mobileImage 字段，如果没有则回退
    const desktopImageUrl = `${newArrivalData.backgroundImage.url}`;
    const mobileImageUrl = newArrivalData.mobileImage?.url
        ? `${newArrivalData.mobileImage.url}`
        : desktopImageUrl;

    // 缩略图用于加载优化
    const smallImageUrl = newArrivalData.backgroundImage.formats?.medium?.url
        ? `${newArrivalData.backgroundImage.formats.medium.url}`
        : desktopImageUrl;

    return (
        <section className="relative w-full overflow-hidden bg-white">

            {/* 1. 标题区域：位于两个模块之间，负责撑开间距 */}
            <div className="w-full py-16 md:py-28 px-10 flex flex-col items-center justify-center text-center border-t border-gray-50">
                <h2 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 tracking-tight leading-tight">
                    {newArrivalData.title}
                </h2>
                {newArrivalData.subtitle && (
                    <p className="mt-5 text-sm md:text-base text-gray-400 font-light tracking-[0.3em] italic uppercase">
                        {newArrivalData.subtitle}
                    </p>
                )}
                {/* 装饰线：增加视觉高级感 */}
                <div className="mt-8 w-16 h-[1px] bg-pink-600/40" />
            </div>

            {/* 2. 图片展示区域：应用 picture 标签实现响应式双图 */}
            <div className="group relative w-full h-[65vh] md:h-[75vh] min-h-[500px]">
                <div className="absolute inset-0">
                    <picture>
                        {/* 移动端媒体查询：小于 768px 使用手机图 */}
                        <source media="(max-width: 767px)" srcSet={mobileImageUrl} />
                        <img
                            src={desktopImageUrl}
                            alt={newArrivalData.backgroundImage.alternativeText || newArrivalData.title}
                            className="w-full h-full object-cover transition-transform duration-[3000ms] ease-out group-hover:scale-110"
                            sizes="100vw"
                            srcSet={`${smallImageUrl} 800w, ${desktopImageUrl} 1600w`}
                            loading="lazy"
                        />
                    </picture>

                    {/* 遮罩层：稍微加深一点，确保 description 的白字在亮色图片下也清晰 */}
                    <div className="absolute inset-0 bg-black/25 group-hover:bg-black/35 transition-colors duration-700" />
                </div>

                {/* 3. 图片内内容层：仅保留描述和按钮 */}
                <div className="relative h-full flex items-center justify-center">
                    <div className="max-w-3xl px-6 text-center text-white">

                        {/* 描述文本：放大字号并增加行间距 */}
                        <div className="text-white text-lg md:text-2xl mb-12 max-w-2xl mx-auto leading-relaxed drop-shadow-lg font-light">
                            {newArrivalData.description.split('\n').map((line, index) => (
                                <p key={index} className="mb-2">{line}</p>
                            ))}
                        </div>

                        {/* 按钮：采用极简线性风格或实色风格 */}
                        <div className="flex justify-center">
                            <LocalizedClientLink
                                href={targetHref}
                                className="px-12 py-4 border-2 border-white text-white text-sm font-bold tracking-[0.2em] uppercase hover:bg-white hover:text-black transition-all duration-500 transform hover:-translate-y-1"
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