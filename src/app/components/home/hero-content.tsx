"use client"

import { useEffect, useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const ease = "cubic-bezier(0.22, 0.61, 0.36, 1)"

export default function HeroContent({
    title,
    subtitle,
    buttonText,
    targetHref,
}: {
    title: string
    subtitle?: string
    buttonText: string
    targetHref: string
}) {
    const [mounted, setMounted] = useState(false)
    useEffect(() => { setMounted(true) }, [])

    const base: React.CSSProperties = {
        opacity: 0,
        transform: "translateY(28px)",
        transition: `opacity 1000ms ${ease}, transform 1000ms ${ease}`,
    }

    return (
        <div className="relative w-full h-full flex items-end justify-center z-20 pointer-events-none pb-16 md:pb-24">
            <div className="container mx-auto px-6">
                <div className="max-w-3xl text-center mx-auto">
                    <h1
                        className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-white mb-3 leading-tight drop-shadow-2xl tracking-wide"
                        style={mounted ? { ...base, opacity: 1, transform: "translateY(0)" } : base}
                    >
                        {title}
                    </h1>
                    {subtitle && (
                        <p
                            className="text-sm md:text-base text-white/90 mb-6 drop-shadow-lg max-w-xl mx-auto font-light tracking-wider"
                            style={
                                mounted
                                    ? { ...base, opacity: 1, transform: "translateY(0)", transitionDelay: "120ms" }
                                    : base
                            }
                        >
                            {subtitle}
                        </p>
                    )}
                    <div
                        className="pointer-events-auto"
                        style={
                            mounted
                                ? { ...base, opacity: 1, transform: "translateY(0)", transitionDelay: "250ms" }
                                : base
                        }
                    >
                        <LocalizedClientLink
                            href={targetHref}
                            className="inline-flex items-center justify-center px-8 py-2.5 text-sm font-semibold text-black bg-white hover:bg-gray-100 rounded-full transition-all hover:scale-105 shadow-2xl uppercase tracking-widest"
                        >
                            {buttonText}
                        </LocalizedClientLink>
                    </div>
                </div>
            </div>
        </div>
    )
}
