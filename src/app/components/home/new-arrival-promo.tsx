import { getNewArrivalPromo } from '../../../lib/strapi/home-data'
import { listProductsWithSort } from "@lib/data/products" // 引入列表页同款方法
import { getRegion } from "@lib/data/regions"
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { getSelectedLocale } from "@lib/data/locales"
import NewArrivalCarousel from "./new-arrival-carousel";

export default async function NewArrivalPromo() {
    const localecode = (await getSelectedLocale()) || 'en-US'
    const newArrivalData = await getNewArrivalPromo(localecode)
    const countryCode = "us" // 建议根据实际环境获取
    const region = await getRegion(countryCode)

    if (!newArrivalData || !region) return null

    // --- 核心修改：使用列表页同款逻辑查询 ---
    // 构造和 PaginatedProducts 一致的查询参数
    const queryParams = {
        limit: 10, // 首页取 10 个够用了
        collection_id: [newArrivalData.medusaHandle].filter(Boolean),
        // 关键点：使用 created_at 降序排序，让后加的商品排在最前
        order: "-created_at"
    }

    const {
        response: { products },
    } = await listProductsWithSort({
        page: 1,
        queryParams,
        sortBy: "created_at", // 对应列表页逻辑
        countryCode,
    })

    const getHref = () => {
        const handle = newArrivalData.medusaHandle
        if (!handle) return "/"
        switch (newArrivalData.linkType) {
            case 'category': return `/categories/${handle}`
            case 'collection': return `/collections/${handle}`
            case 'product': return `/products/${handle}`
            case 'external': return handle
            default: return "/"
        }
    }

    const targetHref = getHref()
    // ... 媒体逻辑 (Media Logic) 保持不变 ...
    const desktopMedia = newArrivalData.backgroundImage
    const mobileMedia = newArrivalData.mobileImage || desktopMedia
    const isDesktopVideo = desktopMedia?.mime?.includes('video')
    const isMobileVideo = mobileMedia?.mime?.includes('video')

    return (
        <section className="relative w-full bg-white pb-0 overflow-hidden">
            {/* 1. 标题区域 */}
            <div className="w-full pt-12 pb-8 px-10 flex flex-col items-center justify-center text-center">
                <h2 className="text-[14px] md:text-[16px] font-bold text-gray-900 tracking-[0.3em] uppercase">
                    {newArrivalData.title}
                </h2>
                {newArrivalData.subtitle && (
                    <p className="mt-2 text-[10px] text-gray-400 font-light tracking-[0.15em] uppercase text-gray-400">
                        {newArrivalData.subtitle}
                    </p>
                )}
            </div>

            {/* 2. 海报区域 */}
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
                        {newArrivalData.buttonText || "Shop Collection"}
                    </LocalizedClientLink>
                </div>
            </div>

            {/* 3. 调用客户端滑动组件 */}
            {/* 这里的 products 已经是处理好排序的 Medusa 原始数据对象数组 */}
            <NewArrivalCarousel products={products} targetHref={targetHref} />
        </section>
    )
}