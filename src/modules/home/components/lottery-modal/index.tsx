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

        const targetIdx = Math.floor(Math.random() * PRIZES.length)
        setPrizeIndex(targetIdx)

        const degreesPerSlice = 360 / PRIZES.length
        const pointerOffset = 30
        const baseRotation = -(targetIdx + 0.5) * degreesPerSlice + pointerOffset
        const randomSpins = 360 * (8 + Math.floor(Math.random() * 5))
        const finalRotation = randomSpins + baseRotation

        setRotation(finalRotation)

        console.group('🎡 轮盘调试')
        console.log('🎯 目标索引:', targetIdx)
        console.log('🎁 目标奖品:', PRIZES[targetIdx].label)
        console.log('📐 每扇区角度:', degreesPerSlice, '°')
        console.log('🔄 基础旋转:', baseRotation, '°')
        console.log('🎲 最终旋转:', finalRotation, '°')
        console.log('📍 指针偏移补偿:', pointerOffset, '°')
        console.groupEnd()

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
                <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none p-4 animate-in fade-in duration-300 backdrop-blur-sm overflow-hidden">
                    <div className="relative bg-white border border-black shadow-[0_45px_100px_-20px_rgba(0,0,0,0.4)] rounded-[2.5rem] p-8 sm:p-12 max-w-[500px] w-full pointer-events-auto animate-in zoom-in-95 duration-500 text-center max-h-[90vh] overflow-y-auto">

                        <button onClick={() => setIsVisible(false)} className="absolute top-4 right-4 sm:top-8 sm:right-8 text-gray-400 hover:text-black transition-colors z-50">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>

                        {!showResult ? (
                            <>
                                <header className="mb-6 sm:mb-10">
                                    <h2 className="text-3xl sm:text-4xl font-black tracking-tighter uppercase italic mb-2 leading-none text-black">Lucky Spin</h2>
                                    <p className="text-gray-400 text-[11px] tracking-[0.2em] uppercase font-bold">Try your luck today</p>
                                </header>

                                {/* ✅ 轮盘容器响应式尺寸 */}
                                <div className="relative w-72 h-72 sm:w-80 sm:h-80 mx-auto mb-8 sm:mb-12">
                                    {/* ✅ 修复：指针距离按比例调整，SVG 尺寸响应式 */}
                                    <div className="absolute z-50" style={{
                                        left: '50%',
                                        top: '50%',
                                        // PC: 190px (半径 160 + 间距 55 - 指针半高 25)
                                        // 手机：155px (半径 144 + 间距 36 - 指针半高 25)
                                        transform: 'translate(-50%, -50%) rotate(30deg) translateY(-155px)'
                                    }}>
                                        {/* ✅ 响应式指针 SVG：手机缩小到 80% */}
                                        <svg
                                            width="32"
                                            height="40"
                                            viewBox="0 0 40 50"
                                            className="drop-shadow-lg rotate-180 sm:w-10 sm:h-[50px]"
                                        >
                                            <path d="M20 50 L32 15 L20 0 L8 15 Z" fill="#f97316" />
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
                                <div className="text-6xl sm:text-7xl mb-8 text-orange-500 font-black italic text-center">WINNER!</div>
                                <h2 className="text-2xl sm:text-3xl font-black uppercase italic mb-8 leading-none text-center">
                                    {prizeIndex !== null ? PRIZES[prizeIndex].label : ''}
                                </h2>
                                <div className="bg-gray-50 border-2 border-black border-dashed p-8 mb-10 rounded-2xl">
                                    <span className="text-3xl sm:text-4xl font-mono font-black tracking-widest uppercase block text-center">
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