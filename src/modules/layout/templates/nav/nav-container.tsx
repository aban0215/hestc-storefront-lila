"use client"

import { useEffect, useState } from "react"

export default function NavContainer({ children }: { children: React.ReactNode }) {
    const [isScrolled, setIsScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            // 滚动超过 50px 时收起前两行
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <div className={`sticky top-0 inset-x-0 z-[999] transition-all duration-500 ease-in-out ${
            isScrolled ? "-translate-y-[100px]" : "translate-y-0"
        }`}>
            {children}
        </div>
    )
}