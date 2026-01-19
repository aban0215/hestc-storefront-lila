import { getBestSellerConfig } from '../../../lib/strapi/home-data'
import { getSimplifiedProducts } from '../../../lib/medusa/products'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { getSelectedLocale } from "@lib/data/locales";
import { sdk } from "@lib/config"
import ProductCarousel from "./product-carousel";

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

    // 控制首页瀑布流显示的数量，建议 4 或 6 个
    const productsToShow = sortedProducts.slice(0, bestSellerConfig.displayCount || 4)

    const productsForCarousel = sortedProducts.slice(0, 15)

    return (
        <section className="bg-white pt-10">
            {/* 1. 标题区域：PC端增加 View All 链接 */}
            <div className="w-full pb-8 px-4 lg:px-8 flex items-end justify-between">
                {/* 占位，保持标题居中效果或靠左展示 */}
                <div className="hidden lg:block w-32"></div>

                <div className="text-center">
                    <h2 className="text-[14px] md:text-[16px] font-bold text-gray-900 tracking-[0.3em] uppercase">
                        {bestSellerConfig.title}
                    </h2>
                    {bestSellerConfig.subtitle && (
                        <p className="mt-2 text-[10px] text-gray-400 font-light tracking-[0.15em] uppercase">
                            {bestSellerConfig.subtitle}
                        </p>
                    )}
                </div>

                {/* PC端标题行右侧 View All */}
                <div className="hidden lg:flex w-32 justify-end">
                    <LocalizedClientLink
                        href={targetHref}
                        className="text-[10px] font-bold tracking-widest uppercase border-b border-black pb-0.5 hover:text-gray-400 hover:border-gray-400 transition-all"
                    >
                        View All
                    </LocalizedClientLink>
                </div>
            </div>

            {/* 2. 交互展示区域 */}
            <ProductCarousel
                products={productsForCarousel}
                targetHref={targetHref}
                title={bestSellerConfig.title}
            />
        </section>
    )
}