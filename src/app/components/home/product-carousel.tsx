"use client"
import { useState } from "react"
import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import FadeUpOnScroll from "@modules/common/components/fade-up-on-scroll"

export default function ProductCarousel({ products, targetHref, title }) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const displayProducts = products.slice(0, 6)

    /**
     * 价格转换函数：将类似 "10$" 转换为 "$10.00 USD"
     * 1. 提取数字并强制两位小数
     * 2. 提取符号并映射到货币代码
     */
    const formatPrice = (priceStr) => {
        if (!priceStr) return ""

        // 提取数字部分
        const numericValue = priceStr.replace(/[^0-9.]/g, '')
        // 提取货币符号
        const symbolMatch = priceStr.match(/[^0-9. ]/)
        const symbol = symbolMatch ? symbolMatch[0] : '$'

        const currencyMap = {
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

    const next = () => currentIndex + 5 < displayProducts.length && setCurrentIndex(c => c + 5)
    const prev = () => currentIndex > 0 && setCurrentIndex(c => c - 5)

    return (
        <div className="w-full overflow-hidden">
            {/* PC 端：5列滑动 */}
            <div className="hidden lg:block relative group px-10">
                <div className="overflow-hidden">
                    <div
                        className="flex transition-transform duration-700 ease-in-out gap-[1px] bg-gray-100 border-y border-gray-100"
                        style={{ transform: `translateX(-${(currentIndex / 5) * 100}%)` }}
                    >
                        {displayProducts.map((product, i) => (
                            <FadeUpOnScroll
                                key={product.handle}
                                delay={i * 50}
                                duration={600}
                                className="min-w-[calc(20%-0.8px)] bg-white group flex flex-col"
                            >
                            <LocalizedClientLink
                                href={`/products/${product.handle}`}
                                className="bg-white group flex flex-col h-full"
                            >
                                <div className="aspect-[3/4] overflow-hidden relative">
                                    <Image
                                        src={product.thumbnail}
                                        alt={product.title}
                                        fill
                                        sizes="20vw"
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                </div>
                                <div className="py-6 px-5 text-center flex flex-col justify-between flex-grow">
                                    {/* 标题：保持半粗，允许两行换行 */}
                                    <h3 className="text-sm md:text-[15px] font-semibold uppercase tracking-wider text-gray-900 line-clamp-2 min-h-[2.5rem] leading-tight">
                                        {product.title}
                                    </h3>

                                    {/* 价格：字体大且黑，但不加粗 (font-normal) */}
                                    <p className="mt-3 text-sm md:text-base text-gray-900 font-normal tracking-tight">
                                        {formatPrice(product.price)}
                                    </p>
                                </div>
                            </LocalizedClientLink>
                            </FadeUpOnScroll>
                        ))}
                    </div>
                </div>

                {/* 箭头控制 */}
                {currentIndex > 0 && (
                    <button onClick={prev} className="absolute left-2 top-[40%] z-10 p-2 bg-white/80 backdrop-blur shadow-sm rounded-full hover:bg-black hover:text-white transition-all">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 19l-7-7 7-7"/></svg>
                    </button>
                )}
                {currentIndex + 5 < displayProducts.length && (
                    <button onClick={next} className="absolute right-2 top-[40%] z-10 p-2 bg-white/80 backdrop-blur shadow-sm rounded-full hover:bg-black hover:text-white transition-all">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 5l7 7-7 7"/></svg>
                    </button>
                )}
            </div>

            {/* 移动端：瀑布流 */}
            <div className="lg:hidden flex flex-col">
                <div className="grid grid-cols-2 gap-[1px] bg-gray-100 border-y border-gray-100">
                    {products.slice(0, 6).map((product, i) => (
                        <FadeUpOnScroll key={product.handle} delay={i * 50} duration={600} className="bg-white flex flex-col">
                        <LocalizedClientLink href={`/products/${product.handle}`} className="bg-white flex flex-col h-full">
                            <div className="aspect-[3/4] overflow-hidden relative">
                                <Image src={product.thumbnail} fill sizes="50vw" className="object-cover" alt={product.title} />
                            </div>
                            <div className="py-5 px-3 text-center border-t border-gray-50/50 flex flex-col flex-grow">
                                {/* 移动端标题 */}
                                <h3 className="text-[12px] font-semibold uppercase text-gray-900 line-clamp-2 leading-tight min-h-[2rem]">
                                    {product.title}
                                </h3>
                                {/* 移动端价格：不加粗 */}
                                <p className="text-[13px] text-gray-900 mt-2 font-normal">
                                    {formatPrice(product.price)}
                                </p>
                            </div>
                        </LocalizedClientLink>
                        </FadeUpOnScroll>
                    ))}
                </div>

                {/* View All */}
                <div className="w-full flex justify-end px-4 py-6">
                    <LocalizedClientLink
                        href={targetHref}
                        className="flex items-center gap-x-2 group"
                    >
                        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-900 border-b border-black pb-0.5 group-active:text-gray-400 group-active:border-gray-400 transition-all">
                            View All
                        </span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-900 group-active:text-gray-400 transition-all">
                            <path d="M9 18l6-6-6-6" />
                        </svg>
                    </LocalizedClientLink>
                </div>
            </div>
        </div>
    )
}