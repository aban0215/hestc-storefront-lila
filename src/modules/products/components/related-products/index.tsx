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

  if (!region) {
    return null
  }

  // --- 逻辑优化：多维度加权抓取 ---

  // 1. 尝试获取同系列 (Collection) 商品
  const collectionProducts = product.collection_id
      ? await listProducts({
        queryParams: {
          collection_id: [product.collection_id],
          region_id: region.id,
          limit: 9 // 多取一个用于过滤掉自身
        },
        countryCode,
      }).then(({ response }) => response.products)
      : []

  // 2. 如果同系列商品不足 8 个，尝试用同标签 (Tags) 补齐
  let taggedProducts: HttpTypes.StoreProduct[] = []
  if (collectionProducts.length < 9 && product.tags?.length) {
    taggedProducts = await listProducts({
      queryParams: {
        tag_id: product.tags.map(t => t.id).filter(Boolean) as string[],
        region_id: region.id,
        limit: 9
      },
      countryCode,
    }).then(({ response }) => response.products)
  }

  // 3. 合并、去重、过滤掉当前正在浏览的商品
  const allProducts = [...collectionProducts, ...taggedProducts]
  const seenIds = new Set()
  const filteredProducts = allProducts.filter((p) => {
    if (p.id === product.id || seenIds.has(p.id)) return false
    seenIds.add(p.id)
    return true
  })

  // 最终取 8 个（PC端展示 8 个，手机端通过 CSS 隐藏后 4 个或允许滚动）
  const finalProducts = filteredProducts.slice(0, 8)

  if (!finalProducts.length) {
    return null
  }

  return (
      <div className="w-full">
        {/* --- UI 优化：LV 风格标题 --- */}
        <div className="flex flex-col items-center text-center mb-16 md:mb-24">
          <h3 className="text-xl md:text-2xl font-light tracking-[0.2em] uppercase text-gray-900">
            You May Also Like
          </h3>
          <div className="mt-6 w-10 h-[1px] bg-black"></div>
        </div>

        {/* --- 网格系统：手机端 2 列，PC 端 4 列 --- */}
        {/* 限制数量逻辑：
          1. 通过 slice(0, 8) 保证数据源最多 8 个
          2. 手机端 grid-cols-2 配合 hidden/block 控制显示数量
      */}
        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-8 md:gap-y-16">
          {finalProducts.map((p, index) => (
              <li
                  key={p.id}
                  className={`
              ${index >= 4 ? "hidden lg:block" : "block"} 
              /* 手机端只显示前4个，PC端显示全部8个 */
            `}
              >
                <Product region={region} product={p} />
              </li>
          ))}
        </ul>
      </div>
  )
}