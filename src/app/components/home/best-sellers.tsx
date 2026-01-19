import { getBestSellerConfig } from '../../../lib/strapi/home-data'
import { listProductsWithSort } from "@lib/data/products" // 换成这个，确保排序一致
import { getRegion } from "@lib/data/regions"
import { getSelectedLocale } from "@lib/data/locales";
import ProductCarousel from "./product-carousel"
import LocalizedClientLink from "@modules/common/components/localized-client-link";

export default async function BestSellers({ regionId }: { regionId: string }) {
    const localecode = (await getSelectedLocale()) || 'en-US';
    const bestSellerConfig = await getBestSellerConfig(localecode)

    // 统一 countryCode，建议这里根据业务逻辑动态获取，比如从 regionId 查或者透传
    const countryCode = "us"
    const region = await getRegion(countryCode)

    if (!bestSellerConfig || !region) return null;

    const handle = bestSellerConfig.medusaHandle;
    const type = bestSellerConfig.linkType;

    // --- 核心修改：使用统一的排序查询 ---
    const queryParams: any = {
        limit: 15,
        // 根据类型（分类或系列）注入 ID 参数
        ...(type === 'collection' ? { collection_id: [handle] } : { category_id: [handle] }),
        // 关键：带上负号，让新货排在最前面，对齐列表页
        order: "-created_at"
    }

    let products = [];
    try {
        const { response } = await listProductsWithSort({
            page: 1,
            queryParams,
            sortBy: "created_at",
            countryCode,
        })
        products = response.products
    } catch (e) {
        console.error("BestSellers fetch error:", e)
    }

    if (!products || !products.length) return null;

    const getHref = () => {
        if (!handle) return "/";
        return type === 'collection' ? `/collections/${handle}` : `/categories/${handle}`;
    };
    const targetHref = getHref();

    return (
        <section className="bg-white pt-10">
            {/* 1. 标题区域 - 保持你的高级感布局 */}
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

            {/* 2. 调用客户端展示组件（PC端5列滚动 / 移动端2列+右下角入口） */}
            <ProductCarousel
                products={products}
                targetHref={targetHref}
                title={bestSellerConfig.title}
            />
        </section>
    )
}