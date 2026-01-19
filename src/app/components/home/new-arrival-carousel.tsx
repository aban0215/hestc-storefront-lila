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

    return (
        <div className="mt-1 bg-gray-100">
            <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar gap-[1px]">
                {products.map((product) => (
                    <LocalizedClientLink
                        key={product.handle}
                        href={`/products/${product.handle}`}
                        // md:min-w-[20%] 确保 PC 端一行显示 5 个 (100 / 5 = 20)
                        className="min-w-[50%] md:min-w-[20%] snap-start bg-white flex flex-col group"
                    >
                        <div className="aspect-[3/4] overflow-hidden relative">
                            {product.thumbnail && (
                                <img
                                    src={product.thumbnail}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    alt={product.title}
                                />
                            )}
                        </div>

                        <div className="pt-3 pb-5 px-2 text-center">
                            <h3 className="text-[10px] font-medium uppercase tracking-wider text-gray-900 truncate px-2">
                                {product.title}
                            </h3>
                            <p className="text-[9px] text-gray-400 mt-1 font-light tracking-widest">
                                {product.price}
                            </p>
                        </div>
                    </LocalizedClientLink>
                ))}

                {/* 查看全部卡片 - 宽度同步调整 */}
                <LocalizedClientLink
                    href={targetHref}
                    className="min-w-[50%] md:min-w-[20%] snap-start bg-white group border-l border-gray-100 flex flex-col items-center justify-center"
                >
                    <div className="flex flex-col items-center justify-center py-10">
                        <span className="text-[9px] tracking-[0.3em] uppercase text-gray-400 group-hover:text-black transition-colors">
                            Explore All
                        </span>
                        <div className="mt-2 w-8 h-[1px] bg-gray-200 group-hover:w-12 group-hover:bg-black transition-all"></div>
                    </div>
                </LocalizedClientLink>
            </div>
        </div>
    )
}