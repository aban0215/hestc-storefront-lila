"use client"
import { useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function ProductCarousel({ products, targetHref, title }) {
    const [currentIndex, setCurrentIndex] = useState(0)

    // PC 切换逻辑：每次移动 100% (即5个位置)
    const next = () => currentIndex + 5 < products.length && setCurrentIndex(c => c + 5)
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
                        {products.map((product) => (
                            <LocalizedClientLink
                                href={`/products/${product.handle}`}
                                key={product.handle}
                                className="min-w-[calc(20%-0.8px)] bg-white group flex flex-col"
                            >
                                <div className="aspect-[3/4] overflow-hidden">
                                    <img src={product.thumbnail} alt={product.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                </div>
                                <div className="py-6 px-4 text-center">
                                    <h3 className="text-[11px] font-medium uppercase tracking-widest text-gray-900 truncate">{product.title}</h3>
                                    <p className="mt-2 text-[10px] text-gray-400 font-light">{product.price}</p>
                                </div>
                            </LocalizedClientLink>
                        ))}
                    </div>
                </div>

                {/* 箭头控制 */}
                {currentIndex > 0 && (
                    <button onClick={prev} className="absolute left-2 top-[40%] z-10 p-2 bg-white/80 backdrop-blur shadow-sm rounded-full hover:bg-black hover:text-white transition-all">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 19l-7-7 7-7"/></svg>
                    </button>
                )}
                {currentIndex + 5 < products.length && (
                    <button onClick={next} className="absolute right-2 top-[40%] z-10 p-2 bg-white/80 backdrop-blur shadow-sm rounded-full hover:bg-black hover:text-white transition-all">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 5l7 7-7 7"/></svg>
                    </button>
                )}
            </div>

            {/* 移动端：瀑布流 + 底部 View All */}
            {/* 2. 移动端布局: 2列网格 */}
            <div className="lg:hidden flex flex-col">
                <div className="grid grid-cols-2 gap-[1px] bg-gray-100 border-y border-gray-100">
                    {/* 只显示前 5 个商品 */}
                    {products.slice(0, 5).map((product) => (
                        <LocalizedClientLink href={`/products/${product.handle}`} key={product.handle} className="bg-white">
                            <div className="aspect-[3/4] overflow-hidden">
                                <img src={product.thumbnail} className="w-full h-full object-cover" alt={product.title} />
                            </div>
                            <div className="py-4 px-2 text-center">
                                <h3 className="text-[10px] font-medium uppercase truncate">{product.title}</h3>
                                <p className="text-[9px] text-gray-400 mt-1">{product.price}</p>
                            </div>
                        </LocalizedClientLink>
                    ))}

                    {/* 第 6 个格子：View All 引导块 */}
                    <LocalizedClientLink
                        href={targetHref}
                        className="bg-white flex flex-col items-center justify-center aspect-[3/4] group active:bg-gray-50 transition-colors"
                    >
                        <div className="flex flex-col items-center gap-2">
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-900">
          View All
        </span>
                            {/* 一个精致的小箭头或者装饰线 */}
                            <div className="w-6 h-[1px] bg-gray-200 group-active:w-10 group-active:bg-black transition-all duration-300"></div>
                            <span className="text-[9px] text-gray-400 uppercase tracking-widest mt-1">
          {title}
        </span>
                        </div>
                    </LocalizedClientLink>
                </div>
            </div>
        </div>
    )
}