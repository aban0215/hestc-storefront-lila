"use client" // 改为客户端组件，解决 Hydration 冲突

import { useEffect, useState } from "react"
import { getNewArrivalPromo } from '../../../lib/strapi/home-data'
import { getProductsByCollectionHandle } from '../../../lib/medusa/products'
import { getRegion } from "@lib/data/regions"
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { getSelectedLocale } from "@lib/data/locales"

export default function NewArrivalPromo() {
    const [data, setData] = useState<any>(null)
    const [products, setProducts] = useState<any[]>([])
    const [mounted, setMounted] = useState(false)

    // 1. 统一在客户端加载数据，彻底解决服务器与客户端渲染不一致的问题
    useEffect(() => {
        const fetchData = async () => {
            const localecode = (await getSelectedLocale()) || 'en-US'
            const region = await getRegion("us")
            const promo = await getNewArrivalPromo(localecode)

            if (promo && region) {
                setData(promo)
                const items = await getProductsByCollectionHandle(
                    promo.medusaHandle || "",
                    region.id,
                    region.currency_code,
                    8
                )
                setProducts(items)
            }
            setMounted(true)
        };
        fetchData()
    }, [])

    if (!mounted || !data) return null; // 在挂载完成前不渲染，避开 Hydration Error

    const getHref = () => {
        const handle = data.medusaHandle;
        if (!handle) return "/";
        switch (data.linkType) {
            case 'category': return `/categories/${handle}`;
            case 'collection': return `/collections/${handle}`;
            case 'product': return `/products/${handle}`;
            case 'external': return handle;
            default: return "/";
        }
    };

    const targetHref = getHref();
    const desktopMedia = data.backgroundImage;
    const mobileMedia = data.mobileImage || desktopMedia;
    const isDesktopVideo = desktopMedia?.mime?.includes('video');
    const isMobileVideo = mobileMedia?.mime?.includes('video');

    return (
        <section className="relative w-full bg-white pb-0 overflow-hidden">
            {/* 1. 标题区域 */}
            <div className="w-full pt-12 pb-8 px-10 flex flex-col items-center justify-center text-center">
                <h2 className="text-[14px] md:text-[16px] font-bold text-gray-900 tracking-[0.3em] uppercase">
                    {data.title}
                </h2>
                {data.subtitle && (
                    <p className="mt-2 text-[10px] text-gray-400 font-light tracking-[0.15em] uppercase">
                        {data.subtitle}
                    </p>
                )}
            </div>

            {/* 2. 媒体展示区域 */}
            <div className="group relative w-full h-[55vh] md:h-[70vh] overflow-hidden bg-gray-100">
                <div className="absolute inset-0">
                    <div className="block md:hidden h-full w-full">
                        {isMobileVideo ? (
                            <video src={mobileMedia?.url} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                        ) : (
                            mobileMedia?.url && <img src={mobileMedia.url} alt="" className="w-full h-full object-cover" />
                        )}
                    </div>
                    <div className="hidden md:block h-full w-full">
                        {isDesktopVideo ? (
                            <video src={desktopMedia?.url} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                        ) : (
                            desktopMedia?.url && <img src={desktopMedia.url} alt="" className="w-full h-full object-cover" />
                        )}
                    </div>
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                </div>
                <div className="relative h-full flex items-end justify-center pb-12">
                    <LocalizedClientLink
                        href={targetHref}
                        className="px-10 py-3 border border-white text-white text-[10px] font-bold tracking-[0.2em] uppercase backdrop-blur-sm hover:bg-white hover:text-black transition-all"
                    >
                        {data.buttonText || "Shop Collection"}
                    </LocalizedClientLink>
                </div>
            </div>

            {/* 3. 商品横向滑动区域 */}
            <div className="mt-1 bg-gray-100">
                <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar gap-[1px]">
                    {products.map((product) => (
                        <LocalizedClientLink
                            key={product.handle}
                            href={`/products/${product.handle}`}
                            className="min-w-[50%] md:min-w-[25%] snap-start bg-white flex flex-col group"
                        >
                            <div className="aspect-[3/4] overflow-hidden">
                                {product.thumbnail && (
                                    <img src={product.thumbnail} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="" />
                                )}
                            </div>
                            <div className="pt-3 pb-5 px-2 text-center">
                                <h3 className="text-[10px] font-medium uppercase tracking-wider text-gray-900 truncate px-2">{product.title}</h3>
                                <p className="text-[9px] text-gray-400 mt-1 font-light tracking-widest">{product.price}</p>
                            </div>
                        </LocalizedClientLink>
                    ))}

                    <LocalizedClientLink
                        href={targetHref}
                        className="min-w-[50%] md:min-w-[25%] snap-start bg-white flex flex-col items-center justify-center border-l border-gray-100"
                    >
                        <span className="text-[9px] tracking-[0.3em] uppercase text-gray-400">Explore All</span>
                        <div className="mt-2 w-8 h-[1px] bg-gray-200"></div>
                    </LocalizedClientLink>
                </div>
            </div>
        </section>
    )
}