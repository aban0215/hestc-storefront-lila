import { getHomeCollections, type HomeCollectionEntry } from '../../../lib/strapi/home-data'
import { getProductsByCollectionHandle } from '../../../lib/medusa/products'
import { getSelectedLocale } from "@lib/data/locales"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import FadeUpOnScroll from "@modules/common/components/fade-up-on-scroll"
import ProductCarousel from "./product-carousel"

async function CollectionBlock({ entry, region, index = 0 }: { entry: HomeCollectionEntry; region: HttpTypes.StoreRegion; index?: number }) {
    const handle = entry.medusa_handle
    const products = handle
        ? await getProductsByCollectionHandle(handle, region.id, region.currency_code, entry.displayCount * 3)
        : []

    if (!products.length) return null

    const getHref = () => {
        if (!handle) return "/"
        switch (entry.link_type) {
            case 'category': return `/categories/${handle}`
            case 'collection': return `/collections/${handle}`
            case 'product': return `/products/${handle}`
            case 'external': return handle
            default: return "/"
        }
    }

    const targetHref = getHref()
    const desktopMedia = entry.backgroundImage
    const mobileMedia = entry.mobileImage || desktopMedia

    return (
        <FadeUpOnScroll as="section" delay={index * 120} className="relative w-full bg-white pb-0 overflow-hidden">
            {/* 标题区域 */}
            <div className="w-full pt-12 pb-8 px-10 flex flex-col items-center justify-center text-center">
                <h2 className="text-[14px] md:text-[16px] font-bold text-gray-900 tracking-[0.3em] uppercase">
                    {entry.title}
                </h2>
                {entry.subtitle && (
                    <p className="mt-2 text-[10px] text-gray-400 font-light tracking-[0.15em] uppercase">
                        {entry.subtitle}
                    </p>
                )}
            </div>

            {/* 背景海报区域 */}
            {(desktopMedia || mobileMedia) && (
                <div className="group relative w-full aspect-[3/2] overflow-hidden bg-gray-100">
                    <div className="absolute inset-0">
                        <div className="block md:hidden h-full w-full">
                            {mobileMedia?.url && (
                                <img src={mobileMedia.url} alt="" className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105" />
                            )}
                        </div>
                        <div className="hidden md:block h-full w-full">
                            {desktopMedia?.url && (
                                <img src={desktopMedia.url} alt="" className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105" />
                            )}
                        </div>
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-500" />
                    </div>
                    <div className="relative h-full flex items-end justify-center pb-12">
                        <LocalizedClientLink
                            href={targetHref}
                            className="inline-block px-10 py-3 border border-white text-white text-[10px] font-bold tracking-[0.2em] uppercase backdrop-blur-sm hover:bg-white hover:text-black transition-all duration-300"
                        >
                            {entry.buttonText || "Shop Now"}
                        </LocalizedClientLink>
                    </div>
                </div>
            )}

            {/* 商品展示 */}
            {products.length > 0 && (
                <ProductCarousel
                    products={products.slice(0, entry.displayCount * 3)}
                    targetHref={targetHref}
                    title={entry.title}
                />
            )}
        </FadeUpOnScroll>
    )
}

export default async function CollectionsSection({ region }: { region: HttpTypes.StoreRegion }) {
    const localecode = (await getSelectedLocale()) || 'en-US'
    const entries = await getHomeCollections(localecode)

    if (!entries.length) return null

    return (
        <>
            {entries.map((entry, index) => (
                <CollectionBlock key={entry.id} entry={entry} region={region} index={index} />
            ))}
        </>
    )
}
