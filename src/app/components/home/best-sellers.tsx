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


    const getHref = () => {
        const handle = bestSellerConfig.medusaHandle;
        if (!handle) return "/"; // 兜底返回首页

        switch (bestSellerConfig.linkType) {
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
            <div className="container mx-auto px-4 py-2 flex justify-center">
                <LocalizedClientLink
                    href={targetHref}
                    className="inline-block px-12 py-3 border border-black text-black text-xs font-bold tracking-[0.2em] hover:bg-black hover:text-white transition-all duration-300"
                >
                    {bestSellerConfig.buttonText.toUpperCase()}
                </LocalizedClientLink>
            </div>

            {/* 这里调用滑动子组件 */}
            <BestSellersSlider products={productsToShow} />
        </section>
    )
}