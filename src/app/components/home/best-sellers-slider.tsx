"use client"

import React, { useRef, useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper';
import LocalizedClientLink from '@modules/common/components/localized-client-link'

// 必须引入基础样式
import 'swiper/css'

export default function BestSellersSlider({ products }: { products: any[] }) {
    const swiperRef = useRef<SwiperType | null>(null);
    const [mounted, setMounted] = useState(false);
    const [_, setRender] = useState({});

    // 关键点 1: 确保组件只在客户端挂载后才渲染 Swiper
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!products || products.length === 0) return null;

    // 在挂载前渲染一个静态占位，避免 Hydration 错误
    if (!mounted) {
        return (
            <div className="w-full border-y border-gray-100 bg-gray-100">
                <div className="flex overflow-hidden">
                    {/* 手机端展示 2 个占位块，PC 端展示 6 个 */}
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className={`min-w-[50%] lg:min-w-[16.66%] bg-white aspect-[3/4] border-r border-gray-50`} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="relative group/section w-full border-y border-gray-100 bg-gray-100">
            <Swiper
                // 关键点 2: 增加唯一 key，防止切换响应式布局时实例崩溃
                key="best-sellers-swiper"
                modules={[Navigation]}
                onSwiper={(swiper) => {
                    swiperRef.current = swiper;
                    setRender({});
                }}
                loop={products.length >= 6}
                slidesPerView={2}
                spaceBetween={1}
                breakpoints={{
                    768: { slidesPerView: 3 },
                    1024: { slidesPerView: 6 },
                }}
                className="w-full"
            >
                {products.map((product, index) => (
                    <SwiperSlide key={`${product.handle}-${index}`} className="bg-white">
                        {/* 轮播图内部的图片与文字区域 */}
                        <LocalizedClientLink href={`/products/${product.handle}`} className="block group">
                            <div className="aspect-[3/4] overflow-hidden bg-gray-50">
                                {product.thumbnail ? (
                                    <img
                                        src={product.thumbnail}
                                        alt={product.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            {/* --- 重点修改区域：LV 风格文字排版 --- */}
                            <div className="p-3 md:p-4 flex flex-col items-start text-left bg-white">
                                {/* 标题：去掉 uppercase，增加行高，左对齐 */}
                                <h3 className="text-[13px] md:text-[15px] font-normal text-gray-900 leading-snug line-clamp-2 transition-colors duration-300">
                                    {product.title}
                                </h3>

                                {/* 价格：字体变细、变浅 (text-gray-500)，去掉加粗 */}
                                <p className="mt-1.5 text-[13px] md:text-[14px] font-light text-gray-500 tracking-tight">
                                    {product.price}
                                </p>
                            </div>
                        </LocalizedClientLink>
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* 左右按钮 - 仅在非手机端显示，手机端通常习惯直接滑动 */}
            <button
                onClick={(e) => {
                    e.preventDefault();
                    swiperRef.current?.slidePrev();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 w-10 h-10 bg-white/90 shadow-lg rounded-full hidden md:flex items-center justify-center text-gray-800 opacity-0 group-hover/section:opacity-100 transition-opacity hover:bg-black hover:text-white"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            <button
                onClick={(e) => {
                    e.preventDefault();
                    swiperRef.current?.slideNext();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 w-10 h-10 bg-white/90 shadow-lg rounded-full hidden md:flex items-center justify-center text-gray-800 opacity-0 group-hover/section:opacity-100 transition-opacity hover:bg-black hover:text-white"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    )
}