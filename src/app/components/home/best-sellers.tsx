import { getBestSellerConfig } from '../../../lib/strapi/home-data'
import { getSimplifiedProducts } from '../../../lib/medusa/products'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import {getSelectedLocale} from "@lib/data/locales";
import { sdk } from "@lib/config"




async function getCurrencyCodeFromRegion(regionId: string) {
    console.log('regionId' + regionId + 'regionId')
    const { region } = await sdk.store.region.retrieve(regionId)
    return region.currency_code
}


interface BestSellersProps {
    regionId: string;
}


export default async function BestSellers({ regionId }: BestSellersProps) {

    console.log('oerr' + regionId)

    const currencycode = await getCurrencyCodeFromRegion(regionId);

    const localecode = (await getSelectedLocale()) || 'en-US';

    // 1. 从Strapi获取配置数据
    const bestSellerConfig = await getBestSellerConfig(localecode ?? '')

    if (!bestSellerConfig) {
        return (
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center">
                        <p className="text-gray-500">暂无热销商品配置</p>
                    </div>
                </div>
            </section>
        )
    }

    // 2. 从配置中提取商品handles
    const productHandles = bestSellerConfig.products.map(p => p.producthandle)

    if (productHandles.length === 0) {
        return (
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-2">
                            {bestSellerConfig.title}
                        </h2>
                        <p className="text-gray-600">
                            {bestSellerConfig.subtitle}
                        </p>
                    </div>
                </div>
            </section>
        )
    }


    // 3. 从Medusa获取商品详情
    const products = await getSimplifiedProducts(productHandles,regionId,currencycode)

    // 4. 按Strapi中的sortOrder排序
    const sortedProducts = [...products].sort((a, b) => {
        const aIndex = bestSellerConfig.products.findIndex(p => p.producthandle === a.originalHandle)
        const bIndex = bestSellerConfig.products.findIndex(p => p.producthandle === b.originalHandle)
        return aIndex - bIndex
    })

    // 5. 限制显示数量
    const productsToShow = sortedProducts.slice(0, bestSellerConfig.displayCount)

    return (
        <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
                {/* 模块标题 */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-2">
                        {bestSellerConfig.title}
                    </h2>
                    <p className="text-gray-600">
                        {bestSellerConfig.subtitle}
                    </p>
                </div>

                {/* 商品网格 */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
                    {productsToShow.map((product, index) => (
                        <div
                            key={`${product.originalHandle}-${index}`}
                            className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300"
                        >
                            <LocalizedClientLink
                                href={product.handle}
                                className="block p-4"
                            >
                                {/* 商品图片 */}
                                <div className="aspect-square overflow-hidden rounded-lg mb-3 bg-gray-100">
                                    {product.thumbnail ? (
                                        <img
                                            src={product.thumbnail}
                                            alt={product.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}
                                </div>

                                {/* 商品信息 */}
                                <div className="text-center">
                                    <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2 h-10">
                                        {product.title}
                                    </h3>
                                    <p className="text-lg font-bold text-pink-600">
                                        {product.price}
                                    </p>
                                </div>
                            </LocalizedClientLink>

                            {/* 热销标签 */}
                  {/*          {index < 3 && (*/}
                  {/*              <div className="absolute top-2 left-2">*/}
                  {/*<span className="px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-full">*/}
                  {/*  热销*/}
                  {/*</span>*/}
                  {/*              </div>*/}
                  {/*          )}*/}
                        </div>
                    ))}
                </div>

                {/* 查看全部按钮 */}
                <div className="text-center mt-10">
                    <LocalizedClientLink
                        href={bestSellerConfig.buttonLink}
                        className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-gray-900 hover:bg-black rounded-md transition-colors group"
                    >
                        <span>{bestSellerConfig.buttonText}</span>
                        <svg
                            className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </LocalizedClientLink>
                </div>
            </div>
        </section>
    )
}