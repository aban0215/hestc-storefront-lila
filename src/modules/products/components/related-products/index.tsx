import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"
import Product from "../product-preview"

type RelatedProductsProps = {
    product: HttpTypes.StoreProduct
    countryCode: string
}

export default async function RelatedProducts({
                                                  product,
                                                  countryCode,
                                              }: RelatedProductsProps) {
    const region = await getRegion(countryCode)
    if (!region) return null

    const baseParams: HttpTypes.StoreProductListParams = {
        region_id: region.id,
        is_giftcard: false,
    }

    // --- 数据获取：确保能拿到足够的货 ---
    // 优先取同集合，拿 12 个做 Buffer，确保过滤掉自身后还有足够的量
    let fetchedProducts: HttpTypes.StoreProduct[] = []

    const { response } = await listProducts({
        queryParams: {
            ...baseParams,
            collection_id: product.collection_id ? [product.collection_id] : undefined,
            limit: 12
        },
        countryCode,
    })

    fetchedProducts = response.products

    // 如果同集合货太少，直接抓全店补齐（保底逻辑）
    if (fetchedProducts.length < 5) {
        const { response: fallbackRes } = await listProducts({
            queryParams: { ...baseParams, limit: 12 },
            countryCode,
        })
        fetchedProducts = [...fetchedProducts, ...fallbackRes.products]
    }

    // --- 数据清洗：去重、去自身、切片 ---
    const productMap = new Map()
    fetchedProducts.forEach(p => {
        if (p.id !== product.id) productMap.set(p.id, p)
    })

    // 最终取 8 个作为 PC 端的数据源
    const finalProducts = Array.from(productMap.values()).slice(0, 8)

    if (finalProducts.length === 0) return null

    return (
        <div className="w-full">
            {/* 标题部分 */}
            <div className="flex flex-col items-center text-center mb-16 md:mb-24">
                <h3 className="text-xl md:text-2xl font-light tracking-[0.2em] uppercase text-gray-900">
                    You May Also Like
                </h3>
                <div className="mt-6 w-10 h-[1px] bg-black"></div>
            </div>

            {/* --- 网格控制 --- */}
            {/* 1. 手机端 grid-cols-2，通过 index 控制只显示 4 个
          2. PC 端 (lg) grid-cols-4，显示全部 8 个
      */}
            <ul className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-8 md:gap-y-16">
                {finalProducts.map((p, index) => (
                    <li
                        key={p.id}
                        className={`
              /* 核心逻辑：index 0-3 始终显示，4-7 只在 lg(PC) 及以上显示 */
              ${index < 4 ? "block" : "hidden lg:block"}
            `}
                    >
                        <Product region={region} product={p} />
                    </li>
                ))}
            </ul>
        </div>
    )
}