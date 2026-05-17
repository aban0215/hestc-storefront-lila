import { getHomeCategorySection } from '../../../lib/strapi/home-data'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { getSelectedLocale } from "@lib/data/locales";
import { getProductsByCollectionHandle, getProductsByCategoryHandle } from '../../../lib/medusa/products'
import { HttpTypes } from "@medusajs/types"

export default async function CategoryShowcase({ region }: { region: HttpTypes.StoreRegion }) {
    const localecode = (await getSelectedLocale()) || 'en-US';
    const sectionData = await getHomeCategorySection(localecode)

    if (!sectionData || !sectionData.featuredCategories || sectionData.featuredCategories.length === 0) {
        return null
    }

    const formatPrice = (priceStr: string) => {
        if (!priceStr) return ""
        const numericValue = priceStr.replace(/[^0-9.]/g, '')
        const symbolMatch = priceStr.match(/[^0-9. ]/)
        const symbol = symbolMatch ? symbolMatch[0] : '$'
        const currencyMap: Record<string, string> = {
            '$': 'USD', '€': 'EUR', '£': 'GBP', '¥': 'CNY', 'HK$': 'HKD'
        }
        const currencyCode = currencyMap[symbol] || 'USD'
        const parsedNumber = parseFloat(numericValue)
        if (isNaN(parsedNumber)) return priceStr
        return `${symbol}${parsedNumber.toFixed(2)} ${currencyCode}`
    }

    const categoriesWithProducts = await Promise.all(
        sectionData.featuredCategories.map(async (category: any) => {
            let products = [];
            const handle = category.medusaHandle?.replace(/^\//, '');
            if (handle) {
                if (category.linkType === 'collection') {
                    products = await getProductsByCollectionHandle(handle, region.id, region.currency_code, 4);
                } else if (category.linkType === 'category') {
                    products = await getProductsByCategoryHandle(handle, region.id, region.currency_code, 4);
                }
            }
            return { ...category, products };
        })
    );

    const getCategoryHref = (category: any) => {
        const handle = category.medusaHandle;
        if (!handle) return "/";
        return category.linkType === 'category' ? `/categories/${handle}` : `/collections/${handle}`;
    };

    return (
        <section className="bg-white overflow-hidden">
            {/* 1. 标题区域 */}
            <div className="w-full pt-16 pb-20 px-4 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <h2 className="text-[14px] md:text-[18px] font-bold text-gray-900 tracking-[0.6em] uppercase">
                    {sectionData.title || "Shop by Category"}
                </h2>
                <div className="mt-4 h-[1px] w-12 bg-black mx-auto transform transition-all duration-700 hover:w-24"></div>
            </div>

            <div className="flex flex-col">
                {categoriesWithProducts.map((item, index) => {
                    const categoryHref = getCategoryHref(item);
                    const isEven = index % 2 === 0;

                    return (
                        <div key={item.id} className="grid grid-cols-1 md:grid-cols-2 border-b border-gray-100 overflow-hidden">

                            {/* --- 左图入口 --- */}
                            <LocalizedClientLink
                                href={categoryHref}
                                // 手机端高度从 70vh 提升到 90vh，PC保持 130vh
                                className={`relative w-full h-[80vh] md:h-[130vh] group overflow-hidden bg-gray-200 ${
                                    isEven ? "md:order-1" : "md:order-2"
                                }`}
                            >
                                <div className="absolute inset-0">
                                    {item.image?.url && (
                                        <img
                                            src={item.image.url}
                                            alt={item.name}
                                            className="w-full h-full object-cover transition-transform duration-[3000ms] group-hover:scale-105"
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-black/25 group-hover:bg-black/40 transition-colors duration-1000" />
                                </div>
                                <div className="relative h-full flex flex-col items-center justify-end text-white p-10 text-center pb-12 md:pb-16">
                                    <div className="px-8 py-3 border border-white text-[10px] md:text-[11px] tracking-[0.4em] uppercase hover:bg-white hover:text-black transition-all duration-500">
                                        View Collection
                                    </div>
                                </div>
                            </LocalizedClientLink>

                            {/* --- 右侧 4 商品 --- */}
                            {/* 手机端总高度提升到 110vh，确保每个商品有足够纵向空间 */}
                            <div className={`grid grid-cols-2 grid-rows-2 h-[100vh] md:h-[130vh] gap-[1px] bg-gray-100 ${
                                isEven ? "md:order-2" : "md:order-1"
                            }`}>
                                {item.products.slice(0, 4).map((product: any) => (
                                    <LocalizedClientLink
                                        key={product.handle}
                                        href={`/products/${product.handle}`}
                                        className="relative flex flex-col bg-white group/item overflow-hidden"
                                    >
                                        {/* 图片区域比例：flex-[6] 压榨文字空间给图片 */}
                                        <div className="relative flex-[6] overflow-hidden">
                                            <img
                                                src={product.thumbnail}
                                                alt={product.title}
                                                className="w-full h-full object-cover transition-transform duration-[1500ms] ease-out group-hover/item:scale-110"
                                            />
                                        </div>

                                        {/* 文字区域：极致压缩，紧凑排列 */}
                                        <div className="flex-[1] py-3 px-3 md:py-4 md:px-5 text-center flex flex-col justify-center border-t border-gray-50 bg-white">
                                            <h4 className="text-[11px] md:text-[14px] font-semibold uppercase tracking-widest text-gray-900 line-clamp-1 leading-none">
                                                {product.title}
                                            </h4>
                                            <p className="mt-1.5 md:mt-2 text-[12px] md:text-[15px] text-gray-900 font-normal tracking-tighter">
                                                {formatPrice(product.price)}
                                            </p>
                                        </div>
                                    </LocalizedClientLink>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>
        </section>
    )
}