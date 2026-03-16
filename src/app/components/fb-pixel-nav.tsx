"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect } from "react"

export default function FBPixelNavigation() {
    const pathname = usePathname()
    const searchParams = useSearchParams()

    useEffect(() => {
        if (typeof window !== "undefined" && (window as any).fbq) {
            (window as any).fbq("track", "PageView")
        }
    }, [pathname, searchParams])

    return null
}