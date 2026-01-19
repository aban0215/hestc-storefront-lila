// BestSellers/index.tsx
import { getBestSellerConfig } from '../../../lib/strapi/home-data'
import { getProductsByCollectionHandle, getProductsByCategoryHandle } from '../../../lib/medusa/products'
import { getRegion } from "@lib/data/regions"
import { getSelectedLocale } from "@lib/data/locales";
import ProductCarousel from "./product-carousel"

export default async function BestSellers({ regionId }: { regionId: string }) {
    const localecode = (await getSelectedLocale()) || 'en-US';
    const bestSellerConfig = await getBestSellerConfig(localecode)

    // 1. 获取 Region 和 货币信息
    const region = await getRegion("us") // 建议根据实际情况获取
    if (!bestSellerConfig || !region) return null;

    const handle = bestSellerConfig.medusaHandle;
    const type = bestSellerConfig.linkType; // 'collection' 或 'category'

    // 2. 核心逻辑：直接从 Medusa 抓取该分类/系列下的前 15 个商品
    let products = [];
    try {
        if (type === 'collection') {
            products = await getProductsByCollectionHandle(
                handle,
                region.id,
                region.currency_code,
                15 // 抓 15 个给 PC 端滑动
            )
        } else {
            products = await getProductsByCategoryHandle(
                handle,
                region.id,
                region.currency_code,
                15
            )
        }
    } catch (e) {
        console.error("Medusa fetch error:", e)
    }

    if (!products.length) return null;

    // 3. 构建跳转链接
    const getHref = () => {
        if (!handle) return "/";
        return type === 'collection' ? `/collections/${handle}` : `/categories/${handle}`;
    };
    const targetHref = getHref();

    return (
        <section className="bg-white pt-10">
            {/* 1. 标题区域 */}
            <div className="w-full pb-8 px-4 lg:px-10 flex items-end justify-between">
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
                <div className="hidden lg:flex w-32 justify-end">
                    <LocalizedClientLink
                        href={targetHref}
                        className="text-[10px] font-bold tracking-widest uppercase border-b border-black pb-0.5 hover:text-gray-400 hover:border-gray-400 transition-all"
                    >
                        View All
                    </LocalizedClientLink>
                </div>
            </div>

            {/* 2. 调用客户端展示组件 */}
            <ProductCarousel
                products={products}
                targetHref={targetHref}
                title={bestSellerConfig.title}
            />
        </section>
    )
}