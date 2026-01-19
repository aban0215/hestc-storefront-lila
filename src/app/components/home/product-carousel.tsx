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
            <div className="lg:hidden flex flex-col">
                <div className="grid grid-cols-2 gap-[1px] bg-gray-100 border-y border-gray-100">
                    {/* 满打满算显示 6 个商品，保持 3 排整齐 */}
                    {products.slice(0, 6).map((product) => (
                        <LocalizedClientLink href={`/products/${product.handle}`} key={product.handle} className="bg-white">
                            <div className="aspect-[3/4] overflow-hidden">
                                <img src={product.thumbnail} className="w-full h-full object-cover" alt={product.title} />
                            </div>
                            <div className="py-4 px-2 text-center border-t border-gray-50/50">
                                <h3 className="text-[10px] font-medium uppercase truncate text-gray-900">{product.title}</h3>
                                <p className="text-[9px] text-gray-400 mt-1 font-light tracking-widest">{product.price}</p>
                            </div>
                        </LocalizedClientLink>
                    ))}
                </div>

                {/* 优化点：右下角轻量化入口 */}
                <div className="w-full flex justify-end px-4 py-6">
                    <LocalizedClientLink
                        href={targetHref}
                        className="flex items-center gap-x-2 group"
                    >
      <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-900 border-b border-black pb-0.5 group-active:text-gray-400 group-active:border-gray-400 transition-all">
        View All {title}
      </span>
                        <svg
                            width="14" height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            className="text-gray-900 group-active:text-gray-400 transition-all"
                        >
                            <path d="M9 18l6-6-6-6" />
                        </svg>
                    </LocalizedClientLink>
                </div>
            </div>
        </div>
    )
}