"use client"

import { useParams, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { X } from "lucide-react"

export default function CountrySuggestionBanner({
                                                    detectedCountry,
                                                }: {
    detectedCountry: string
}) {
    const params = useParams()
    const pathname = usePathname()
    const [isVisible, setIsVisible] = useState(false)

    // 获取当前 URL 里的国家码 (例如 /us/cart -> us)
    const currentCountry = (params.countryCode as string)?.toLowerCase()

    useEffect(() => {
        // 1. 如果用户已经手动关闭过，则不再显示
        const hasDismissed = localStorage.getItem("dismiss-country-suggestion")
        if (hasDismissed) return

        // 2. 只有当检测到的 IP 国家与当前页面国家不一致时才显示
        if (
            detectedCountry &&
            currentCountry &&
            detectedCountry.toLowerCase() !== currentCountry
        ) {
            setIsVisible(true)
        }
    }, [detectedCountry, currentCountry])

    const handleDismiss = () => {
        setIsVisible(false)
        localStorage.setItem("dismiss-country-suggestion", "true")
    }

    if (!isVisible || !detectedCountry || !currentCountry) return null

    /**
     * 构造精准的跳转链接
     * 修复了路径叠加问题 (如 /us/cn)
     */
    const getSwitchUrl = () => {
        // 将路径分割并过滤掉空值，例如 "/us/products" -> ["us", "products"]
        const segments = pathname.split("/").filter(Boolean)

        if (segments[0]?.toLowerCase() === currentCountry) {
            // 如果第一位是当前国家码，将其替换为检测到的国家码
            segments[0] = detectedCountry.toLowerCase()
        } else {
            // 兜底：如果路径开头不是国家码，则将新国家码插入到最前面
            segments.unshift(detectedCountry.toLowerCase())
        }

        // 重新组合路径，确保以 / 开头
        // 结果类似: /cn/products
        const searchParams = typeof window !== "undefined" ? window.location.search : ""
        return `/${segments.join("/")}${searchParams}`
    }

    const switchUrl = getSwitchUrl()

    return (
        <div className="bg-neutral-900 text-white py-3 px-4 flex items-center justify-between text-sm sticky top-0 z-[9999] animate-in fade-in slide-in-from-top duration-300">
            <div className="flex-1 text-center font-medium">
                <span className="opacity-90">It looks like you are in </span>
                <span className="font-bold uppercase text-pink-500">
          {detectedCountry}
        </span>
                .
                <a
                    href={switchUrl}
                    className="ml-3 inline-flex items-center underline decoration-pink-500 underline-offset-4 hover:text-pink-400 transition-colors font-bold"
                >
                    Switch to {detectedCountry.toUpperCase()} store
                </a>
            </div>

            <button
                onClick={handleDismiss}
                className="ml-4 p-1 hover:bg-neutral-800 rounded-full transition-all group"
                aria-label="Close suggestion"
            >
                <X
                    size={18}
                    className="group-hover:rotate-90 transition-transform duration-200"
                />
            </button>
        </div>
    )
}