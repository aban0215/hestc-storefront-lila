"use client"

import { useRouter } from "next/navigation"
import { clx } from "@medusajs/ui"

interface BackButtonProps {
    className?: string
    children?: React.ReactNode
}

export default function BackButton({ className, children }: BackButtonProps) {
    const router = useRouter()

    return (
        <button
            onClick={() => router.back()}
            className={clx(
                "text-[11px] uppercase tracking-[0.2em] text-gray-400 hover:text-black transition-colors flex items-center gap-x-2",
                className
            )}
        >
            <span>←</span>
            {children || "Back"} {/* 默认显示 Back，也可以自定义传入文字 */}
        </button>
    )
}