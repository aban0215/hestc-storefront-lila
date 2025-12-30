"use client"

import { useParams, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { X } from "lucide-react"

export default function CountrySuggestionBanner({ detectedCountry }: { detectedCountry: string }) {
    const params = useParams()
    const pathname = usePathname()
    const [isVisible, setIsVisible] = useState(false)

    // 获取当前页面所属的国家（例如 URL 是 /us/product，则为 us）
    const currentCountry = params.countryCode as string

    useEffect(() => {
        // 逻辑：如果 IP 检测到的国家和当前 URL 的国家不一致
        // 且用户在本次会话中还没关闭过这个提示
        const hasDismissed = localStorage.getItem("dismiss-country-suggestion")

        if (
            detectedCountry &&
            currentCountry &&
            detectedCountry !== currentCountry &&
            !hasDismissed
        ) {
            setIsVisible(true)
        }
    }, [detectedCountry, currentCountry])

    const handleDismiss = () => {
        setIsVisible(false)
        localStorage.setItem("dismiss-country-suggestion", "true")
    }

    if (!isVisible) return null

    // 构造跳转链接：将当前路径中的国家码替换为检测到的国家
    const switchUrl = pathname.replace(`/${currentCountry}`, `/${detectedCountry}`)

    return (
        <div className="bg-pink-600 text-white py-2 px-4 flex items-center justify-between text-sm sticky top-0 z-[9999]">
            <div className="flex-1 text-center">
                It looks like you are in <span className="font-bold uppercase">{detectedCountry}</span>.{" "}
                <a href={switchUrl} className="underline font-bold ml-2">
                    Switch to {detectedCountry.toUpperCase()} store
                </a> for better shipping rates.
            </div>
            <button onClick={handleDismiss} className="ml-4">
                <X size={18} />
            </button>
        </div>
    )
}