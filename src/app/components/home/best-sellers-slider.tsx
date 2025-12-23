"use client"

import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import LocalizedClientLink from '@modules/common/components/localized-client-link'

// 必须引入 Swiper 样式
import 'swiper/css'
import 'swiper/css/navigation'

export default function BestSellersSlider({ products }: { products: any[] }) {
    return (
        <div className="relative group/section w-full border-y border-gray-100 bg-gray-100">
            <Swiper
                modules={[Navigation]}
                navigation={{
                    nextEl: ".btn-next-best",
                    prevEl: ".btn-prev-best",
                }}
                loop={true}
                slidesPerView={2}
                spaceBetween={1}
                breakpoints={{
                    768: { slidesPerView: 3 },
                    1024: { slidesPerView: 6 },
                }}
                className="w-full"
            >
                {products.map((product, index) => (
                    <SwiperSlide key={`${product.originalHandle}-${index}`} className="bg-white">
                        <LocalizedClientLink href={product.handle} className="block group">
                            <div className="aspect-[3/4] overflow-hidden bg-gray-50">
                                {product.thumbnail ? (
                                    <img
                                        src={product.thumbnail}
                                        alt={product.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <div className="p-4 flex flex-col items-center text-center">
                                <h3 className="text-xs md:text-sm font-medium text-gray-800 mb-1 line-clamp-1 group-hover:text-pink-600 transition-colors">
                                    {product.title}
                                </h3>
                                <p className="text-sm md:text-base font-bold text-gray-900">
                                    {product.price}
                                </p>
                            </div>
                        </LocalizedClientLink>
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* 左右箭头 - 仅在悬停时显示 */}
            <button className="btn-prev-best absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white/90 shadow-lg rounded-full flex items-center justify-center text-gray-800 opacity-0 group-hover/section:opacity-100 transition-opacity hover:bg-black hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button className="btn-next-best absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white/90 shadow-lg rounded-full flex items-center justify-center text-gray-800 opacity-0 group-hover/section:opacity-100 transition-opacity hover:bg-black hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
        </div>
    )
}