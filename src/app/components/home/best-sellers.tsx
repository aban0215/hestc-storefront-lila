import { getBestSellerConfig } from '../../../lib/strapi/home-data'
import { getSimplifiedProducts } from '../../../lib/medusa/products'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { getSelectedLocale } from "@lib/data/locales";
import { sdk } from "@lib/config"

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

    return (
        <section className="bg-white">
            {/* 1. 标题区域 - 显著缩小，增加高级感 */}
            <div className="w-full pt-12 pb-8 px-4 flex flex-col items-center justify-center text-center">
                <h2 className="text-[14px] md:text-[16px] font-bold text-gray-900 tracking-[0.3em] uppercase">
                    {bestSellerConfig.title}
                </h2>
                {bestSellerConfig.subtitle && (
                    <p className="mt-2 text-[10px] text-gray-400 font-light tracking-[0.15em] uppercase">
                        {bestSellerConfig.subtitle}
                    </p>
                )}
            </div>

            {/* 2. 商品瀑布流区域 - 2列布局 */}
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-2 gap-y-10">
                    {productsToShow.map((product) => (
                        <LocalizedClientLink
                            href={`/products/${product.handle}`}
                            key={product.handle}
                            className="group flex flex-col"
                        >
                            <div className="aspect-[3/4] overflow-hidden bg-gray-50 relative">
                                {product.thumbnail ? (
                                    <img
                                        src={product.thumbnail}
                                        alt={product.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            {/* 文字信息 */}
                            <div className="mt-4 flex flex-col items-center text-center">
                                <h3 className="text-[11px] font-medium text-gray-900 tracking-wide uppercase truncate w-full">
                                    {product.title}
                                </h3>
                                <p className="mt-1 text-[10px] text-gray-400 tracking-widest">
                                    {product.price}
                                </p>
                            </div>
                        </LocalizedClientLink>
                    ))}
                </div>
            </div>

            {/* 3. 查看全部 - 移到底部，作为瀑布流的收尾 */}
            <div className="py-16 flex justify-center">
                <LocalizedClientLink
                    href={targetHref}
                    className="inline-block px-12 py-3 border border-black text-black text-[10px] font-bold tracking-[0.2em] hover:bg-black hover:text-white transition-all duration-300 uppercase"
                >
                    {bestSellerConfig.buttonText || "Shop All"}
                </LocalizedClientLink>
            </div>
        </section>
    )
}