import { getBestSellerConfig } from '../../../lib/strapi/home-data'
import { getSimplifiedProducts } from '../../../lib/medusa/products'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { getSelectedLocale } from "@lib/data/locales";
import { sdk } from "@lib/config"
import BestSellersSlider from "./best-sellers-slider"

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

    const getHref = () => {
        const handle = bestSellerConfig.medusaHandle;
        if (!handle) return "/";

        switch (bestSellerConfig.linkType) {
            case 'category': return `/categories/${handle}`;
            case 'collection': return `/collections/${handle}`;
            case 'product': return `/products/${handle}`;
            case 'external': return handle;
            default: return "/";
        }
    };

    const targetHref = getHref();
    const productHandles = bestSellerConfig.products.map(p => p.producthandle)
    const products = await getSimplifiedProducts(productHandles, regionId, currencycode)

    const sortedProducts = [...products].sort((a, b) => {
        const aIndex = bestSellerConfig.products.findIndex(p => p.producthandle === a.originalHandle)
        const bIndex = bestSellerConfig.products.findIndex(p => p.producthandle === b.originalHandle)
        return aIndex - bIndex
    })

    const productsToShow = sortedProducts.slice(0, bestSellerConfig.displayCount)

    return (
        <section className="bg-white overflow-hidden">
            {/* 1. 标题区域：与 Category/NewArrivalPromo 风格完全一致 */}
            <div className="w-full py-8 md:py-14 px-10 flex flex-col items-center justify-center text-center border-t border-gray-50">
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 leading-tight">
                    {bestSellerConfig.title || "Best Sellers"}
                </h2>
                {bestSellerConfig.subtitle && (
                    <p className="mt-3 md:mt-4 text-sm md:text-base text-gray-400 font-light tracking-[0.3em] italic uppercase">
                        {bestSellerConfig.subtitle}
                    </p>
                )}
                {/* 统一的粉色装饰线 */}
                <div className="mt-5 w-16 h-[1px] bg-pink-600/40" />
            </div>

            {/* 2. 查看全部按钮 - 放在 Slider 上方，保持精致的边距 */}
            <div className="container mx-auto px-4 mb-10 flex justify-center">
                <LocalizedClientLink
                    href={targetHref}
                    className="inline-block px-10 py-3 border border-black text-black text-[11px] font-bold tracking-[0.2em] hover:bg-black hover:text-white transition-all duration-300 uppercase"
                >
                    {bestSellerConfig.buttonText || "Shop All"}
                </LocalizedClientLink>
            </div>

            {/* 3. Slider 区域 */}
            <div className="pb-16 md:pb-24">
                <BestSellersSlider products={productsToShow} />
            </div>
        </section>
    )
}