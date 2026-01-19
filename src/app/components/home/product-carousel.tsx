"use client"

import { useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ChevronLeft, ChevronRight } from "@medusajs/icons"

export default function ProductCarousel({ products, targetHref, title }: { products: any[], targetHref: string, title: string }) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const totalProducts = products.length

    // PC端逻辑：一次切5个
    const nextSlide = () => {
        if (currentIndex + 5 < totalProducts) setCurrentIndex(prev => prev + 5)
    }
    const prevSlide = () => {
        if (currentIndex > 0) setCurrentIndex(prev => prev - 5)
    }

    return (
        <div className="w-full">
            {/* 1. PC 端布局: 滑动显示 */}
            <div className="hidden lg:block relative group">
                <div className="overflow-hidden">
                    <div
                        className="flex transition-transform duration-700 ease-in-out bg-gray-100 gap-[1px] border-y border-gray-100"
                        style={{ transform: `translateX(-${(currentIndex / 5) * 100}%)` }}
                    >
                        {products.map((product) => (
                            <LocalizedClientLink
                                href={`/products/${product.handle}`}
                                key={product.handle}
                                className="min-w-[calc(20%-1px)] bg-white group flex flex-col"
                            >
                                <div className="aspect-[3/4] overflow-hidden">
                                    <img src={product.thumbnail} alt={product.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                </div>
                                <div className="py-6 px-2 flex flex-col items-center text-center">
                                    <h3 className="text-[11px] font-medium text-gray-900 tracking-wide uppercase truncate w-full px-2">{product.title}</h3>
                                    <p className="mt-1 text-[10px] text-gray-400 tracking-widest font-light">{product.price}</p>
                                </div>
                            </LocalizedClientLink>
                        ))}
                    </div>
                </div>

                {/* 左右箭头：仅在有多余商品时显示 */}
                {currentIndex > 0 && (
                    <button onClick={prevSlide} className="absolute left-4 top-[40%] -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <ChevronLeft />
                    </button>
                )}
                {currentIndex + 5 < totalProducts && (
                    <button onClick={nextSlide} className="absolute right-4 top-[40%] -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <ChevronRight />
                    </button>
                )}
            </div>

            {/* 2. 移动端布局: 2列网格（瀑布流感） */}
            <div className="lg:hidden flex flex-col">
                <div className="grid grid-cols-2 gap-[1px] bg-gray-100 border-y border-gray-100">
                    {/* 移动端建议只显示前 4 或 6 个 */}
                    {products.slice(0, 6).map((product) => (
                        <LocalizedClientLink href={`/products/${product.handle}`} key={product.handle} className="bg-white flex flex-col">
                            <div className="aspect-[3/4] overflow-hidden">
                                <img src={product.thumbnail} alt={product.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="py-4 px-2 text-center">
                                <h3 className="text-[10px] font-medium uppercase truncate w-full">{product.title}</h3>
                                <p className="text-[9px] text-gray-400 mt-1">{product.price}</p>
                            </div>
                        </LocalizedClientLink>
                    ))}
                </div>

                {/* 移动端查看全部按钮 */}
                <div className="px-4 py-8">
                    <LocalizedClientLink
                        href={targetHref}
                        className="w-full py-4 border border-gray-200 flex items-center justify-center text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-black hover:text-white transition-all"
                    >
                        View All {title}
                    </LocalizedClientLink>
                </div>
            </div>
        </div>
    )
}