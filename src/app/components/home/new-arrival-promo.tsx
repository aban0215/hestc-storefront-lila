// app/components/home/new-arrival-promo.tsx
import { getNewArrivalPromo } from '../../../lib/strapi/home-data'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { getSelectedLocale } from "@lib/data/locales";

export default async function NewArrivalPromo() {
    const localecode = (await getSelectedLocale()) || 'en-US';
    const newArrivalData = await getNewArrivalPromo(localecode)

    const getHref = () => {
        const handle = newArrivalData.medusaHandle;
        if (!handle) return "/"; // 兜底返回首页

        switch (newArrivalData.linkType) {
            case 'category':
                return `/categories/${handle}`;
            case 'collection':
                return `/collections/${handle}`;
            case 'product':
                return `/products/${handle}`;
            case 'external':
                return handle; // 如果是外部链接，handle 直接存放完整的 URL
            default:
                return "/";
        }
    };

    const targetHref = getHref();

    if (!newArrivalData) {
        return null
    }

    // 构建图片URL
    const imageUrl = `${newArrivalData.backgroundImage.url}`
    const smallImageUrl = newArrivalData.backgroundImage.formats?.medium?.url
        ? `${newArrivalData.backgroundImage.formats.medium.url}`
        : imageUrl

    return (
        <section className="relative w-full overflow-hidden bg-white">
            <div className="group relative w-full h-[60vh] md:h-[70vh] min-h-[500px]">
                {/* 背景图片层 - 统一缩放动画 */}
                <div className="absolute inset-0">
                    <img
                        src={imageUrl}
                        alt={newArrivalData.backgroundImage.alternativeText || newArrivalData.title}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                        sizes="100vw"
                        srcSet={`${smallImageUrl} 1000w, ${imageUrl} 2000w`}
                        loading="lazy"
                    />

                    {/* 遮罩层 - 与品类卡片一致的深色叠加，确保文字可读 */}
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-500" />
                </div>

                {/* 内容层 - 居中对齐 */}
                <div className="relative h-full flex items-center justify-center">
                    <div className="max-w-4xl px-6 text-center text-white">
                        {/* 副标题 - 极简风格 */}
                        <p className="text-sm md:text-base font-medium tracking-[0.2em] uppercase mb-4 opacity-90">
                            {newArrivalData.subtitle}
                        </p>

                        {/* 主标题 - 字体加大且显眼 */}
                        <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold mb-8 leading-tight">
                            {newArrivalData.title}
                        </h2>

                        {/* 描述 - 保持换行，增加过渡动画 */}
                        <div className="text-gray-100 text-base md:text-lg mb-10 max-w-2xl mx-auto space-y-2 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-700">
                            {newArrivalData.description.split('\n').map((line, index) => (
                                <p key={index}>{line}</p>
                            ))}
                        </div>

                        {/* 按钮 - 统一风格：线性边框或实色 */}
                        <div className="flex justify-center">
                            <LocalizedClientLink
                                href={targetHref}
                                className="px-10 py-4 border border-white text-white text-sm font-bold tracking-widest hover:bg-white hover:text-black transition-all duration-300"
                            >
                                {newArrivalData.buttonText}
                            </LocalizedClientLink>
                        </div>
                    </div>
                </div>

                {/* 全区域点击跳转（可选） */}
                <LocalizedClientLink
                    href={targetHref}
                    className="absolute inset-0 z-10"
                    aria-label={newArrivalData.title}
                />
            </div>
        </section>
    )
}