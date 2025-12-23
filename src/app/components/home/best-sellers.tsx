import { getBestSellerConfig } from '../../../lib/strapi/home-data'
import { getSimplifiedProducts } from '../../../lib/medusa/products'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { getSelectedLocale } from "@lib/data/locales";
import { sdk } from "@lib/config"
import BestSellersSlider from "./best-sellers-slider" // 引入刚才创建的文件

async function getCurrencyCodeFromRegion(regionId: string) {
    const { region } = await sdk.store.region.retrieve(regionId)
    return region.currency_code
}

interface BestSellersProps {
    regionId: string;
}

export default async function BestSellers({ regionId }: BestSellersProps) {
    const currencycode = await getCurrencyCodeFromRegion(regionId);
    const localecode = (await getSelectedLocale()) || 'en-US';
    const bestSellerConfig = await getBestSellerConfig(localecode ?? '')

    if (!bestSellerConfig) return null;

    const productHandles = bestSellerConfig.products.map(p => p.producthandle)
    const products = await getSimplifiedProducts(productHandles, regionId, currencycode)

    const sortedProducts = [...products].sort((a, b) => {
        const aIndex = bestSellerConfig.products.findIndex(p => p.producthandle === a.originalHandle)
        const bIndex = bestSellerConfig.products.findIndex(p => p.producthandle === b.originalHandle)
        return aIndex - bIndex
    })

    const productsToShow = sortedProducts.slice(0, bestSellerConfig.displayCount)

    return (
        <section className="bg-white">
            <div className="container mx-auto px-4 pt-3 pb-5">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="relative">
                        <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 tracking-tight relative z-10">
                            {bestSellerConfig.title}
                        </h2>
                        <div className="w-12 h-[2px] bg-pink-600 mt-2"></div>
                    </div>
                    <p className="text-gray-400 text-xs md:text-sm max-w-xs font-light leading-relaxed tracking-wide text-right">
                        {bestSellerConfig.subtitle}
                    </p>
                    <LocalizedClientLink
                        href={bestSellerConfig.buttonLink}
                        className="inline-block px-12 py-3 border border-black text-black text-xs font-bold tracking-[0.2em] hover:bg-black hover:text-white transition-all duration-300"
                    >
                        {bestSellerConfig.buttonText.toUpperCase()}
                    </LocalizedClientLink>
                </div>
            </div>

            {/* 这里调用滑动子组件 */}
            <BestSellersSlider products={productsToShow} />

            {/*<div className="py-3 text-center">*/}
            {/*    <LocalizedClientLink*/}
            {/*        href={bestSellerConfig.buttonLink}*/}
            {/*        className="inline-block px-12 py-3 border border-black text-black text-xs font-bold tracking-[0.2em] hover:bg-black hover:text-white transition-all duration-300"*/}
            {/*    >*/}
            {/*        {bestSellerConfig.buttonText.toUpperCase()}*/}
            {/*    </LocalizedClientLink>*/}
            {/*</div>*/}
        </section>
    )
}