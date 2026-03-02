"use client"

import React, { useState, useEffect } from 'react'

interface Announcement {
    id: number
    text: string
    link?: string
}

const AnnouncementBar = ({ announcements }: { announcements: Announcement[] }) => {
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        if (announcements.length <= 1) return

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % announcements.length)
        }, 4000) // 4秒切换一次

        return () => clearInterval(timer)
    }, [announcements])

    if (!announcements || announcements.length === 0) return null

    return (
        <div className="bg-black text-white h-10 flex items-center justify-center overflow-hidden relative w-full px-4">
            {announcements.map((item, index) => (
                <div
                    key={item.id}
                    className={`absolute transition-all duration-700 ease-in-out transform ${
                        index === currentIndex
                            ? "translate-y-0 opacity-100"
                            : "translate-y-full opacity-0"
                    }`}
                >
                    <p className="text-xs md:text-sm font-medium tracking-wide">
                        {item.link ? (
                            <a href={item.link} className="hover:underline">{item.text}</a>
                        ) : (
                            item.text
                        )}
                    </p>
                </div>
            ))}
        </div>
    )
}

export default AnnouncementBar