import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import FadeUpOnScroll from "@modules/common/components/fade-up-on-scroll"

const ASPECTS = ["aspect-[3/4]", "aspect-[4/5]", "aspect-[1/1]", "aspect-[2/3]", "aspect-[5/6]"]

export default async function MasonryLatest({ region }: { region: HttpTypes.StoreRegion }) {
    const { response } = await listProducts({
        queryParams: { limit: 10, order: "-created_at" },
        countryCode: region.countries?.[0]?.iso_2,
    })

    if (!response.products.length) return null

    const products = response.products

    function formatPrice(priceStr: string) {
        if (!priceStr) return ""
        const num = priceStr.replace(/[^0-9.]/g, "")
        const sym = priceStr.match(/[^0-9. ]/)?.[0] ?? "$"
        const map: Record<string, string> = { "$": "USD", "€": "EUR", "£": "GBP", "¥": "CNY" }
        const p = parseFloat(num)
        return isNaN(p) ? priceStr : `${sym}${p.toFixed(2)} ${map[sym] || "USD"}`
    }

    return (
        <section className="bg-white pt-20 pb-28 overflow-hidden">
            {/* 标题 */}
            <FadeUpOnScroll duration={800}>
                <div className="w-full mb-16 px-6 text-center">
                    <h2 className="text-[13px] md:text-[14px] font-bold text-gray-900 tracking-[0.4em] uppercase">
                        Latest Arrivals
                    </h2>
                    <div className="mt-4 h-[1px] w-10 bg-black mx-auto" />
                </div>
            </FadeUpOnScroll>

            {/* 瀑布流 — CSS columns */}
            <div
                className="px-4 md:px-8 max-w-[1600px] mx-auto"
                style={{
                    columnCount: 2,
                    columnGap: "4px",
                }}
            >
                <style>{`
                    @media (min-width: 768px) { .masonry-container { column-count: 3; } }
                    @media (min-width: 1024px) { .masonry-container { column-count: 4; } }
                    @media (min-width: 1440px) { .masonry-container { column-count: 5; } }
                `}</style>
                <div className="masonry-container" style={{ columnCount: "inherit", columnGap: "inherit" }}>
                    {products.map((product, i) => {
                        const aspect = ASPECTS[i % ASPECTS.length]
                        return (
                            <FadeUpOnScroll
                                key={product.handle || product.id}
                                delay={i * 60}
                                duration={700}
                                className="break-inside-avoid mb-1"
                            >
                                <LocalizedClientLink
                                    href={`/products/${product.handle}`}
                                    className="block bg-gray-50 group relative overflow-hidden"
                                >
                                    <div className={`${aspect} overflow-hidden`}>
                                        <img
                                            src={product.thumbnail || ""}
                                            alt={product.title || ""}
                                            loading="lazy"
                                            className="w-full h-full object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-105"
                                        />
                                    </div>
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-500 flex items-end p-4">
                                        <div className="translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400 w-full">
                                            <h3 className="text-[11px] font-semibold text-white uppercase tracking-wider line-clamp-2 leading-tight">
                                                {product.title}
                                            </h3>
                                            <p className="text-[12px] text-white/90 mt-1 font-light">
                                                {formatPrice(product.price)}
                                            </p>
                                        </div>
                                    </div>
                                </LocalizedClientLink>
                            </FadeUpOnScroll>
                        )
                    })}
                </div>
            </div>

            {/* 底部 View All */}
            <FadeUpOnScroll delay={200} duration={700}>
                <div className="w-full flex justify-center mt-16">
                    <LocalizedClientLink
                        href="/store"
                        className="inline-block px-10 py-3 border border-black text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-black hover:text-white transition-colors duration-300"
                    >
                        View All Products
                    </LocalizedClientLink>
                </div>
            </FadeUpOnScroll>
        </section>
    )
}
