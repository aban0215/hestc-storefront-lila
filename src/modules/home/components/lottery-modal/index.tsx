"use client"

import React, { useState, useEffect } from "react"

const PRIZES = [
    { label: "BOGO FREE", code: "BOGO-FREE", color: "#111111", textColor: "#ffffff" },
    { label: "10% OFF", code: "WELCOME10", color: "#f97316", textColor: "#ffffff" },
    { label: "BUY 2 GET 1", code: "B2G1-FREE", color: "#111111", textColor: "#ffffff" },
    { label: "15% OFF", code: "SAVE15", color: "#f97316", textColor: "#ffffff" },
    { label: "20% OFF", code: "LUCKY20", color: "#111111", textColor: "#ffffff" },
    { label: "BOGO FREE", code: "BOGO-FREE", color: "#f97316", textColor: "#ffffff" },
    { label: "5% OFF", code: "GIFT5", color: "#111111", textColor: "#ffffff" },
    { label: "BUY 2 GET 1", code: "B2G1-FREE", color: "#f97316", textColor: "#ffffff" },
]

const LotteryModal = () => {
    const [isVisible, setIsVisible] = useState(false)
    const [email, setEmail] = useState("")
    const [isSpinning, setIsSpinning] = useState(false)
    const [rotation, setRotation] = useState(0)
    const [prizeIndex, setPrizeIndex] = useState<number | null>(null)
    const [showResult, setShowResult] = useState(false)

    useEffect(() => {
        const played = localStorage.getItem("medusa_lottery_v10_fixed") === "true"
        if (!played) {
            const timer = setTimeout(() => setIsVisible(true), 3000)
            return () => clearTimeout(timer)
        }
    }, [])

    const startSpin = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!email || !emailRegex.test(email)) {
            alert("Please enter a valid email address!")
            return
        }
        if (isSpinning) return

        setIsSpinning(true)

        // 🎯 随机选择奖品索引
        const targetIdx = Math.floor(Math.random() * PRIZES.length)
        setPrizeIndex(targetIdx)

        // 📐 计算每个扇区的角度
        const degreesPerSlice = 360 / PRIZES.length  // 45°

        // 🎯 核心计算逻辑（已修复指针偏移）：
        // 指针在 1 点位置 = 顺时针 30°偏移，需要在基础旋转中补偿
        const pointerOffset = 30  // ✅ 指针偏移补偿
        const baseRotation = -(targetIdx + 0.5) * degreesPerSlice + pointerOffset

        // 🎡 添加 8~12 圈随机旋转，确保动画效果
        const randomSpins = 360 * (8 + Math.floor(Math.random() * 5))
        const finalRotation = randomSpins + baseRotation

        setRotation(finalRotation)

        // 🔍 调试日志

        setTimeout(() => {
            setIsSpinning(false)
            setShowResult(true)
            localStorage.setItem("medusa_lottery_v10_fixed", "true")
        }, 8000)
    }

    const getCoordinatesForPercent = (percent: number) => {
        const x = Math.cos(2 * Math.PI * percent)
        const y = Math.sin(2 * Math.PI * percent)
        return [x, y]
    }

    return (
        <>
            {!isVisible && (
                <button
                    onClick={() => setIsVisible(true)}
                    className="fixed bottom-8 left-8 z-[9998] w-14 h-14 bg-black text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95 group"
                >
                    <span className="absolute inset-0 rounded-full bg-black animate-ping opacity-20"></span>
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                </button>
            )}

            {isVisible && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none p-4 animate-in fade-in duration-300 backdrop-blur-sm">
                    <div className="relative bg-white border border-black shadow-[0_45px_100px_-20px_rgba(0,0,0,0.4)] rounded-[2.5rem] p-12 max-w-[500px] w-full pointer-events-auto animate-in zoom-in-95 duration-500 text-center">

                        <button onClick={() => setIsVisible(false)} className="absolute top-8 right-8 text-gray-400 hover:text-black transition-colors">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>

                        {!showResult ? (
                            <>
                                <header className="mb-10">
                                    <h2 className="text-4xl font-black tracking-tighter uppercase italic mb-2 leading-none text-black">Lucky Spin</h2>
                                    <p className="text-gray-400 text-[11px] tracking-[0.2em] uppercase font-bold">Try your luck today</p>
                                </header>

                                <div className="relative w-80 h-80 mx-auto mb-12">
                                    {/* ✅ 修改：指针在 1 点位置 (30°), 向外偏移至 190px, 图标旋转 180° */}
                                    <div className="absolute z-50" style={{
                                        left: '50%',
                                        top: '50%',
                                        // 执行顺序 (从右到左):
                                        // 1. translateY(-190px): 沿局部 Y 轴向上移动 190px (比之前 145px 向外 45px)
                                        // 2. rotate(30deg): 顺时针旋转 30°到 1 点钟方向
                                        // 3. translate(-50%,-50%): 元素中心对齐圆心
                                        transform: 'translate(-50%, -50%) rotate(30deg) translateY(-170px)'
                                    }}>
                                        <svg width="40" height="50" viewBox="0 0 40 50" className="drop-shadow-lg rotate-180">
                                            {/* 指针图标（旋转 180°后尖端朝上，指向圆盘外） */}
                                            <path d="M20 50 L32 15 L20 0 L8 15 Z" fill="#f97316" />
                                            {/* 底部装饰圆 */}
                                            <circle cx="20" cy="45" r="4" fill="#f97316" />
                                        </svg>
                                    </div>

                                    {/* SVG 轮盘 */}
                                    <div
                                        className="w-full h-full shadow-2xl rounded-full border-[4px] border-black overflow-hidden bg-black"
                                        style={{
                                            transform: `rotate(${rotation}deg)`,
                                            transition: isSpinning
                                                ? 'transform 8s cubic-bezier(0.1, 0, 0.1, 1)'
                                                : 'none'
                                        }}
                                    >
                                        <svg viewBox="-1 -1 2 2" className="w-full h-full -rotate-90">
                                            {PRIZES.map((prize, i) => {
                                                const startPercent = i / PRIZES.length
                                                const endPercent = (i + 1) / PRIZES.length
                                                const [startX, startY] = getCoordinatesForPercent(startPercent)
                                                const [endX, endY] = getCoordinatesForPercent(endPercent)

                                                const midPercent = (i + 0.5) / PRIZES.length
                                                const angle = midPercent * 2 * Math.PI
                                                const textX = Math.cos(angle) * 0.7
                                                const textY = Math.sin(angle) * 0.7

                                                let baseAngle = midPercent * 360
                                                let textAngle = baseAngle + 180
                                                if (baseAngle > 90 && baseAngle < 270) {
                                                    textAngle += 180
                                                }

                                                const pathData = [
                                                    `M 0 0`,
                                                    `L ${startX} ${startY}`,
                                                    `A 1 1 0 0 1 ${endX} ${endY}`,
                                                    `Z`,
                                                ].join(' ')

                                                return (
                                                    <g key={i}>
                                                        <path d={pathData} fill={prize.color} />
                                                        <text
                                                            x={textX}
                                                            y={textY}
                                                            transform={`rotate(${textAngle}, ${textX}, ${textY})`}
                                                            fill={prize.textColor}
                                                            style={{
                                                                fontSize: '0.1px',
                                                                fontWeight: '800',
                                                                textAnchor: 'middle',
                                                                dominantBaseline: 'middle',
                                                                userSelect: 'none'
                                                            }}
                                                        >
                                                            {prize.label}
                                                        </text>
                                                    </g>
                                                )
                                            })}
                                        </svg>
                                    </div>

                                    {/* 中心装饰圆 */}
                                    <div className="absolute inset-0 m-auto w-6 h-6 bg-white border-[4px] border-black rounded-full z-50 shadow-lg"></div>
                                </div>

                                <div className="space-y-6 px-4">
                                    <input
                                        type="email"
                                        placeholder="ENTER YOUR EMAIL"
                                        className="w-full border-b-2 border-gray-100 py-4 text-base focus:border-black focus:outline-none text-center font-bold"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={isSpinning}
                                    />
                                    <button
                                        onClick={startSpin}
                                        disabled={isSpinning || !email}
                                        className="w-full bg-black text-white py-5 rounded-full font-black uppercase text-sm shadow-xl active:scale-95 transition-all disabled:opacity-50"
                                    >
                                        {isSpinning ? "SPINNING..." : "GET MY OFFER"}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="py-10 animate-in zoom-in-95 duration-500">
                                <div className="text-7xl mb-8 text-orange-500 font-black italic text-center">WINNER!</div>
                                <h2 className="text-3xl font-black uppercase italic mb-8 leading-none text-center">
                                    {prizeIndex !== null ? PRIZES[prizeIndex].label : ''}
                                </h2>
                                <div className="bg-gray-50 border-2 border-black border-dashed p-8 mb-10 rounded-2xl">
                                    <span className="text-4xl font-mono font-black tracking-widest uppercase block text-center">
                                        {prizeIndex !== null ? PRIZES[prizeIndex].code : ''}
                                    </span>
                                </div>
                                <button
                                    onClick={() => {
                                        if (prizeIndex !== null) {
                                            navigator.clipboard.writeText(PRIZES[prizeIndex].code)
                                            alert("Copied!")
                                        }
                                        setIsVisible(false)
                                    }}
                                    className="w-full bg-black text-white py-5 rounded-full font-black uppercase"
                                >
                                    COPY & SHOP NOW
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}

export default LotteryModal