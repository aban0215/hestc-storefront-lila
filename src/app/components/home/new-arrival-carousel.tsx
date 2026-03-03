"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function NewArrivalCarousel({
                                               products,
                                               targetHref
                                           }: {
    products: any[],
    targetHref: string
}) {
    if (!products || products.length === 0) return null;

    /**
     * 价格格式化：将 "10$" 转换为 "$10.00 USD"
     */
    const formatPrice = (priceStr: string) => {
        if (!priceStr) return ""

        const numericValue = priceStr.replace(/[^0-9.]/g, '')
        const symbolMatch = priceStr.match(/[^0-9. ]/)
        const symbol = symbolMatch ? symbolMatch[0] : '$'

        const currencyMap: Record<string, string> = {
            '$': 'USD',
            '€': 'EUR',
            '£': 'GBP',
            '¥': 'CNY',
            'HK$': 'HKD'
        }
        const currencyCode = currencyMap[symbol] || 'USD'
        const parsedNumber = parseFloat(numericValue)

        if (isNaN(parsedNumber)) return priceStr

        return `${symbol}${parsedNumber.toFixed(2)} ${currencyCode}`
    }

    return (
        <div className="mt-1 bg-gray-100">
            <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar gap-[1px]">
                {products.map((product) => (
                    <LocalizedClientLink
                        key={product.handle}
                        href={`/products/${product.handle}`}
                        className="min-w-[50%] md:min-w-[20%] snap-start bg-white flex flex-col group"
                    >
                        {/* 图片容器 */}
                        <div className="aspect-[3/4] overflow-hidden relative">
                            {product.thumbnail && (
                                <img
                                    src={product.thumbnail}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    alt={product.title}
                                />
                            )}
                        </div>

                        {/* 文字内容区 */}
                        <div className="pt-5 pb-6 px-4 text-center flex flex-col">
                            {/* 标题修改点：
                                1. 移除了 min-h，避免在标题换行时遮挡价格。
                                2. 使用 line-clamp-2 保证最多显示两行，多出的部分显示省略号。
                                3. leading-normal 增加行间距，防止文字粘连。
                            */}
                            <h3 className="text-[12px] md:text-[14px] font-semibold uppercase tracking-wider text-gray-900 line-clamp-2 leading-normal break-words">
                                {product.title}
                            </h3>

                            {/* 价格修改点：
                                1. mt-3 确保价格与标题之间有固定的物理间距。
                                2. font-normal 保持不加粗。
                            */}
                            <p className="text-[13px] md:text-[14px] text-gray-900 mt-3 font-normal">
                                {formatPrice(product.price)}
                            </p>
                        </div>
                    </LocalizedClientLink>
                ))}

                {/* 查看全部卡片 */}
                <LocalizedClientLink
                    href={targetHref}
                    className="min-w-[50%] md:min-w-[20%] snap-start bg-white group border-l border-gray-100 flex flex-col items-center justify-center"
                >
                    <div className="flex flex-col items-center justify-center py-10">
                        <span className="text-[10px] tracking-[0.3em] uppercase text-gray-400 group-hover:text-black transition-colors font-bold">
                            Explore All
                        </span>
                        <div className="mt-3 w-8 h-[1px] bg-gray-200 group-hover:w-12 group-hover:bg-black transition-all"></div>
                    </div>
                </LocalizedClientLink>
            </div>
        </div>
    )
}