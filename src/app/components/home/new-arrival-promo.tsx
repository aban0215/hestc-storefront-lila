import { getNewArrivalPromo } from '../../../lib/strapi/home-data'
import { getProductsByCollectionHandle } from '../../../lib/medusa/products'
import { getRegion } from "@lib/data/regions"
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { getSelectedLocale } from "@lib/data/locales"
import NewArrivalCarousel from "./new-arrival-carousel";

export default async function NewArrivalPromo() {
    const localecode = (await getSelectedLocale()) || 'en-US'
    const newArrivalData = await getNewArrivalPromo(localecode)
    const region = await getRegion("us")

    if (!newArrivalData || !region) return null

    // 抓取 Medusa 商品
    const collectionProducts = await getProductsByCollectionHandle(
        newArrivalData.medusaHandle || "",
        region.id,
        region.currency_code,
        20
    )


    const getHref = () => {
        const handle = newArrivalData.medusaHandle
        if (!handle) return "/"
        switch (newArrivalData.linkType) {
            case 'category': return `/categories/${handle}`
            case 'collection': return `/collections/${handle}`
            case 'product': return `/products/${handle}`
            case 'external': return handle;
            default: return "/"
        }
    }

    const targetHref = getHref()
    const desktopMedia = newArrivalData.backgroundImage
    const mobileMedia = newArrivalData.mobileImage || desktopMedia
    const isDesktopVideo = desktopMedia?.mime?.includes('video')
    const isMobileVideo = mobileMedia?.mime?.includes('video')

    return (
        <section className="relative w-full bg-white pb-0 overflow-hidden">
            {/* 1. 标题区域 */}
            <div className="w-full pt-12 pb-8 px-10 flex flex-col items-center justify-center text-center">
                <h2 className="text-[14px] md:text-[16px] font-bold text-gray-900 tracking-[0.3em] uppercase">
                    {newArrivalData.title}
                </h2>
                {newArrivalData.subtitle && (
                    <p className="mt-2 text-[10px] text-gray-400 font-light tracking-[0.15em] uppercase">
                        {newArrivalData.subtitle}
                    </p>
                )}
            </div>

            {/* 2. 海报区域 */}
            <div className="group relative w-full h-[55vh] md:h-[70vh] overflow-hidden bg-gray-100">
                <div className="absolute inset-0">
                    <div className="block md:hidden h-full w-full">
                        {isMobileVideo ? (
                            <video src={mobileMedia?.url} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                        ) : (
                            mobileMedia?.url && <img src={mobileMedia.url} alt="" className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105" />
                        )}
                    </div>
                    <div className="hidden md:block h-full w-full">
                        {isDesktopVideo ? (
                            <video src={desktopMedia?.url} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                        ) : (
                            desktopMedia?.url && <img src={desktopMedia.url} alt="" className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105" />
                        )}
                    </div>
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-500" />
                </div>
                <div className="relative h-full flex items-end justify-center pb-12">
                    <LocalizedClientLink
                        href={targetHref}
                        className="inline-block px-10 py-3 border border-white text-white text-[10px] font-bold tracking-[0.2em] uppercase backdrop-blur-sm hover:bg-white hover:text-black transition-all duration-300"
                    >
                        {newArrivalData.buttonText || "Shop Collection"}
                    </LocalizedClientLink>
                </div>
            </div>

            <NewArrivalCarousel products={collectionProducts} targetHref={targetHref} />
        </section>
    )
}