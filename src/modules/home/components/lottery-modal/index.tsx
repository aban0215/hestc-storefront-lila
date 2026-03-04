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

// 定义存储 Key 增加版本号防止冲突
const STORAGE_KEY = "medusa_lottery_v12_data"

const LotteryModal = () => {
    const [isVisible, setIsVisible] = useState(false)
    const [email, setEmail] = useState("")
    const [isSpinning, setIsSpinning] = useState(false)
    const [rotation, setRotation] = useState(0)
    const [prizeIndex, setPrizeIndex] = useState<number | null>(null)
    const [showResult, setShowResult] = useState(false)

    // 1. 初始化检查：如果用户抽过，直接准备好结果页
    useEffect(() => {
        const savedData = localStorage.getItem(STORAGE_KEY)
        if (savedData) {
            try {
                const { index, userEmail } = JSON.parse(savedData)
                setPrizeIndex(index)
                setShowResult(true)
                setEmail(userEmail)
                // 如果已经有结果了，不自动弹出，点左下角礼包才看
                setIsVisible(false)
            } catch (e) {
                console.error("Storage parse error")
            }
        } else {
            // 没抽过的人，3秒后自动弹出
            const timer = setTimeout(() => setIsVisible(true), 3000)
            return () => clearTimeout(timer)
        }
    }, [])

    const startSpin = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!email || !emailRegex.test(email.trim())) {
            alert("Please enter a valid email address!")
            return
        }

        // 校验：虽然有了结果页跳转，但防止用户通过清空状态绕过
        const savedData = localStorage.getItem(STORAGE_KEY)
        if (savedData) {
            alert("This device has already participated!")
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

        setTimeout(() => {
            setIsSpinning(false)
            setShowResult(true)
            // 2. 核心：抽奖完成立刻存入结果
            const dataToSave = {
                index: targetIdx,
                userEmail: email.trim(),
                date: new Date().toISOString()
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave))
        }, 8000)
    }

    const getCoordinatesForPercent = (percent: number) => {
        const x = Math.cos(2 * Math.PI * percent)
        const y = Math.sin(2 * Math.PI * percent)
        return [x, y]
    }

    return (
        <>
            {/* 左下角小礼包按钮 - 响应式优化版 */}
            {!isVisible && (
                <button
                    onClick={() => setIsVisible(true)}
                    // 关键改动：移动端 w-12 h-12 (48px)，PC端 w-14 h-14 (56px)
                    className="fixed bottom-6 left-6 sm:bottom-8 sm:left-8 z-[9998] w-12 h-12 sm:w-14 sm:h-14 bg-black text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95 group"
                >
                    {/* 动画光圈也随之变小 */}
                    <span className="absolute inset-0 rounded-full bg-black animate-ping opacity-20"></span>

                    {/* 图标尺寸：移动端 w-6 (24px)，PC端 w-7 (28px) */}
                    <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>

                    {/* 红点提醒也微调位置 */}
                    {showResult && (
                        <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-orange-500 rounded-full border-2 border-white"></span>
                    )}
                </button>
            )}

            {isVisible && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none p-4 animate-in fade-in duration-300 backdrop-blur-sm overflow-hidden">
                    <div className="relative bg-white border border-black shadow-[0_45px_100px_-20px_rgba(0,0,0,0.4)] rounded-[2.5rem] p-8 sm:p-12 max-w-[500px] w-full pointer-events-auto animate-in zoom-in-95 duration-500 text-center max-h-[90vh] overflow-y-auto">

                        <button onClick={() => setIsVisible(false)} className="absolute top-4 right-4 sm:top-8 sm:right-8 text-gray-400 hover:text-black transition-colors z-50">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>

                        {!showResult ? (
                            // --- 抽奖转盘界面 (略，同你原来的代码) ---
                            <>
                                <header className="mb-6 sm:mb-10">
                                    <h2 className="text-3xl sm:text-4xl font-black tracking-tighter uppercase italic mb-2 leading-none text-black">Lucky Spin</h2>
                                    <p className="text-gray-400 text-[11px] tracking-[0.2em] uppercase font-bold">Try your luck today</p>
                                </header>
                                {/* 轮盘代码... */}
                                <div className="relative w-72 h-72 sm:w-80 sm:h-80 mx-auto mb-8 sm:mb-12">
                                    <div className="absolute z-50" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%) rotate(30deg) translateY(-155px)' }}>
                                        <svg width="32" height="40" viewBox="0 0 40 50" className="drop-shadow-lg rotate-180 sm:w-10 sm:h-[50px]"><path d="M20 50 L32 15 L20 0 L8 15 Z" fill="#f97316" /><circle cx="20" cy="45" r="4" fill="#f97316" /></svg>
                                    </div>
                                    <div className="w-full h-full shadow-2xl rounded-full border-[4px] border-black overflow-hidden bg-black" style={{ transform: `rotate(${rotation}deg)`, transition: isSpinning ? 'transform 8s cubic-bezier(0.1, 0, 0.1, 1)' : 'none' }}>
                                        <svg viewBox="-1 -1 2 2" className="w-full h-full -rotate-90">
                                            {PRIZES.map((prize, i) => {
                                                const startPercent = i / PRIZES.length
                                                const [startX, startY] = getCoordinatesForPercent(startPercent)
                                                const [endX, endY] = getCoordinatesForPercent((i + 1) / PRIZES.length)
                                                const midPercent = (i + 0.5) / PRIZES.length
                                                const angle = midPercent * 2 * Math.PI
                                                const textX = Math.cos(angle) * 0.7
                                                const textY = Math.sin(angle) * 0.7
                                                let textAngle = (midPercent * 360) + 180
                                                if ((midPercent * 360) > 90 && (midPercent * 360) < 270) textAngle += 180
                                                return (
                                                    <g key={i}>
                                                        <path d={`M 0 0 L ${startX} ${startY} A 1 1 0 0 1 ${endX} ${endY} Z`} fill={prize.color} />
                                                        <text x={textX} y={textY} transform={`rotate(${textAngle}, ${textX}, ${textY})`} fill={prize.textColor} style={{ fontSize: '0.1px', fontWeight: '800', textAnchor: 'middle', dominantBaseline: 'middle' }}>{prize.label}</text>
                                                    </g>
                                                )
                                            })}
                                        </svg>
                                    </div>
                                    <div className="absolute inset-0 m-auto w-6 h-6 bg-white border-[4px] border-black rounded-full z-50 shadow-lg"></div>
                                </div>
                                <div className="space-y-6 px-4">
                                    <input type="email" placeholder="ENTER YOUR EMAIL" className="w-full border-b-2 border-gray-100 py-4 text-base focus:border-black focus:outline-none text-center font-bold" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isSpinning} />
                                    <button onClick={startSpin} disabled={isSpinning || !email} className="w-full bg-black text-white py-5 rounded-full font-black uppercase text-sm shadow-xl active:scale-95 transition-all disabled:opacity-50">
                                        {isSpinning ? "SPINNING..." : "GET MY OFFER"}
                                    </button>
                                </div>
                            </>
                        ) : (
                            // --- 结果界面 ---
                            <div className="py-10 animate-in zoom-in-95 duration-500">
                                <div className="text-5xl sm:text-6xl mb-4 text-orange-500 font-black italic text-center leading-tight">YOU WON!</div>
                                <p className="text-gray-400 text-xs mb-8 uppercase tracking-widest">Saved for: {email}</p>

                                <h2 className="text-2xl sm:text-3xl font-black uppercase italic mb-8 leading-none text-center">
                                    {prizeIndex !== null ? PRIZES[prizeIndex].label : ''}
                                </h2>

                                <div className="bg-gray-50 border-2 border-black border-dashed p-8 mb-10 rounded-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 bg-black text-white text-[10px] px-3 py-1 font-bold">COUPON CODE</div>
                                    <span className="text-3xl sm:text-4xl font-mono font-black tracking-widest uppercase block text-center">
                                        {prizeIndex !== null ? PRIZES[prizeIndex].code : ''}
                                    </span>
                                </div>

                                <button
                                    onClick={() => {
                                        if (prizeIndex !== null) {
                                            navigator.clipboard.writeText(PRIZES[prizeIndex].code)
                                            alert("Code Copied! Use it at checkout.")
                                        }
                                        setIsVisible(false)
                                    }}
                                    className="w-full bg-black text-white py-5 rounded-full font-black uppercase shadow-lg hover:bg-gray-900 transition-colors"
                                >
                                    COPY & SHOP NOW
                                </button>

                                <p className="mt-6 text-gray-400 text-[10px] uppercase tracking-tighter">
                                    * This offer is linked to your email address
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}

export default LotteryModal