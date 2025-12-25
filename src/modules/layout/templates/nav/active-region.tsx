"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState, useCallback } from "react"

export default function ActiveRegion() {
    const pathname = usePathname()
    const [localeDisplay, setLocaleDisplay] = useState("")

    // 封装获取 Cookie 的逻辑
    const getLocaleFromCookie = useCallback(() => {
        if (typeof document === "undefined") return ""
        const name = "_medusa_locale="
        const ca = document.cookie.split(';')
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i].trim()
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length)
            }
        }
        return "EN-US"
    }, [])

    useEffect(() => {
        setLocaleDisplay(getLocaleFromCookie())

        // 监听我们在 HeaderLanguageSelect 里触发的自定义事件
        const handleLocaleChange = () => {
            setLocaleDisplay(getLocaleFromCookie())
        }

        window.addEventListener("locale-changed", handleLocaleChange)
        return () => window.removeEventListener("locale-changed", handleLocaleChange)
    }, [pathname, getLocaleFromCookie])

    const countryCode = pathname.split("/")[1]?.toUpperCase() || "US"

    return (
        <span className="text-[10px] font-bold uppercase tracking-widest">
            {localeDisplay} / {countryCode}
         </span>
    )
}