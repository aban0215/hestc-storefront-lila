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
        <section className="bg-white py-10 lg:py-16">
            {/* 标题与按钮区 */}
            <div className="container mx-auto px-4 mb-8 flex flex-col items-center">
                <h2 className="text-xl md:text-2xl font-serif font-bold mb-6 uppercase tracking-[0.3em]">
                    Best Sellers
                </h2>
                <LocalizedClientLink
                    href={targetHref}
                    className="inline-block px-8 py-3 border border-black text-black text-[10px] font-bold tracking-[0.2em] hover:bg-black hover:text-white transition-all duration-300 uppercase"
                >
                    {bestSellerConfig.buttonText || "View All"}
                </LocalizedClientLink>
            </div>

            {/* Slider 区域 - 客户端组件 */}
            <BestSellersSlider products={productsToShow} />
        </section>
    )
}