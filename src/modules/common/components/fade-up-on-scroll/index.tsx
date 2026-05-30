"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

export default function FadeUpOnScroll({
    children,
    delay = 0,
    duration = 800,
    className = "",
    as: Tag = "div",
}: {
    children: ReactNode
    delay?: number
    duration?: number
    className?: string
    as?: "div" | "section" | "article" | "li"
}) {
    const ref = useRef<HTMLDivElement>(null)
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const el = ref.current
        if (!el) return
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true)
                    observer.disconnect()
                }
            },
            { threshold: 0.06, rootMargin: "0px 0px -50px 0px" }
        )
        observer.observe(el)
        return () => observer.disconnect()
    }, [])

    const Comp = Tag as any

    return (
        <Comp
            ref={ref}
            className={className}
            style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(36px)",
                transition: [
                    `opacity ${duration}ms cubic-bezier(0.22, 0.61, 0.36, 1)`,
                    `transform ${duration}ms cubic-bezier(0.22, 0.61, 0.36, 1)`,
                ].join(", "),
                transitionDelay: `${delay}ms`,
                willChange: visible ? "auto" : "opacity, transform",
            }}
        >
            {children}
        </Comp>
    )
}
