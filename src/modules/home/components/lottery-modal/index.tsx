"use client"

import React, { useState, useEffect, useRef } from "react"
import { signup } from "@lib/data/customer"

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

// 用 email 作为 key，绑定到注册用户而非设备
const STORAGE_PREFIX = "medusa_lottery_v13"

function getStorageKey(email: string) {
    return `${STORAGE_PREFIX}_${email}`
}

type Props = {
    isLoggedIn: boolean
    customerEmail?: string
}

const LotteryModal = ({ isLoggedIn, customerEmail }: Props) => {
    const [isVisible, setIsVisible] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [isSpinning, setIsSpinning] = useState(false)
    const [isRegistering, setIsRegistering] = useState(false)
    const [regError, setRegError] = useState("")
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
    const [touched, setTouched] = useState<Record<string, boolean>>({})
    const [rotation, setRotation] = useState(0)
    const [prizeIndex, setPrizeIndex] = useState<number | null>(null)
    const [showResult, setShowResult] = useState(false)

    // 标记是否"刚完成了一次抽奖"，防止 signup 触发的 re-render 把弹窗关了
    const justSpunRef = useRef(false)

    // 初始化：检查该用户是否已抽过奖
    useEffect(() => {
        if (isLoggedIn && customerEmail) {
            setEmail(customerEmail)
            const savedData = localStorage.getItem(getStorageKey(customerEmail))
            if (savedData) {
                try {
                    const { index } = JSON.parse(savedData)
                    setPrizeIndex(index)
                    setShowResult(true)
                    // 刚抽完的 → 保持弹窗打开让用户看结果；老用户 → 只显示礼包按钮
                    if (!justSpunRef.current) {
                        setIsVisible(false)
                    }
                } catch { /* ignore parse error */ }
            } else {
                const timer = setTimeout(() => setIsVisible(true), 3000)
                return () => clearTimeout(timer)
            }
        } else {
            // 未登录：3 秒后弹出注册+抽奖
            const timer = setTimeout(() => setIsVisible(true), 3000)
            return () => clearTimeout(timer)
        }
    }, [isLoggedIn, customerEmail])

    // 关闭弹窗时清理注册错误
    const handleClose = () => {
        if (isSpinning) return // 转盘中不允许关闭
        setIsVisible(false)
        setRegError("")
    }

    // ── 字段级校验 ──
    const validateEmail = (value: string): string => {
        const v = value.trim()
        if (!v) return "Email is required."
        if (v.length > 254) return "Email is too long."
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
        if (!emailRegex.test(v)) return "Please enter a valid email address."
        return ""
    }

    const validatePassword = (value: string): string => {
        if (!value) return "Password is required."
        if (value.length < 6) return "Password must be at least 6 characters."
        if (value.length > 128) return "Password is too long."
        // 至少包含字母+数字或特殊字符
        if (!/[a-zA-Z]/.test(value)) return "Password must contain at least one letter."
        if (!/[0-9!@#$%^&*(),.?":{}|<>_\-]/.test(value)) return "Password must contain at least one number or special character."
        return ""
    }

    const validateName = (value: string, label: string): string => {
        const v = value.trim()
        if (!v) return `${label} is required.`
        if (v.length < 1) return `${label} is too short.`
        if (v.length > 50) return `${label} is too long (max 50 characters).`
        // 只允许字母、空格、连字符、撇号、点（支持国际姓名）
        if (!/^[a-zA-ZÀ-ɏ\s'\-\.]+$/.test(v)) return `${label} contains invalid characters.`
        return ""
    }

    const validateField = (field: string, value: string) => {
        let error = ""
        switch (field) {
            case "email": error = validateEmail(value); break
            case "password": if (!isLoggedIn) error = validatePassword(value); break
            case "firstName": if (!isLoggedIn) error = validateName(value, "First name"); break
            case "lastName": if (!isLoggedIn) error = validateName(value, "Last name"); break
        }
        setFieldErrors(prev => error ? { ...prev, [field]: error } : Object.fromEntries(Object.entries(prev).filter(([k]) => k !== field)))
        return error
    }

    const handleBlur = (field: string, value: string) => {
        setTouched(prev => ({ ...prev, [field]: true }))
        validateField(field, value)
    }

    const startSpin = async () => {
        setRegError("")
        setFieldErrors({})

        // 标记所有字段为 touched
        setTouched({ email: true, password: true, firstName: true, lastName: true })

        // 标记抽奖已开始，防止 signup 后的 re-render 关闭弹窗
        justSpunRef.current = true

        // 1. 字段级校验
        const emailErr = validateEmail(email)
        if (emailErr) { setRegError(emailErr); return }

        if (isSpinning || isRegistering) return

        if (!isLoggedIn) {
            const pwErr = validatePassword(password)
            const fnErr = validateName(firstName, "First name")
            const lnErr = validateName(lastName, "Last name")
            if (pwErr || fnErr || lnErr) {
                setRegError([pwErr, fnErr, lnErr].filter(Boolean).join(" "))
                return
            }

            // 检查该 email 是否已抽过
            if (localStorage.getItem(getStorageKey(email.trim()))) {
                setRegError("This email has already participated in the lottery.")
                return
            }

            setIsRegistering(true)
            const formData = new FormData()
            formData.append("email", email.trim())
            formData.append("password", password)
            formData.append("first_name", firstName.trim())
            formData.append("last_name", lastName.trim())
            formData.append("phone", "")

            const result = await signup(null, formData)
            setIsRegistering(false)

            // signup 返回 customer 对象表示成功，返回字符串表示错误
            if (typeof result === "string") {
                // 邮箱已注册 → 提示登录
                if (result.toLowerCase().includes("duplicate") || result.toLowerCase().includes("already")) {
                    setRegError("This email is already registered. Please sign in first.")
                } else {
                    setRegError(result)
                }
                return
            }
        } else {
            // 已登录：检查该 email 是否已抽过
            if (localStorage.getItem(getStorageKey(email.trim()))) {
                setRegError("You have already participated in the lottery.")
                return
            }
        }

        // 3. 确定奖品并立即存入 localStorage（修复：不在 setTimeout 里存）
        setIsSpinning(true)
        const targetIdx = Math.floor(Math.random() * PRIZES.length)
        setPrizeIndex(targetIdx)

        // 立刻持久化，防止动画期间关闭弹窗/刷新绕过限制
        const dataToSave = {
            index: targetIdx,
            userEmail: email.trim(),
            date: new Date().toISOString()
        }
        localStorage.setItem(getStorageKey(email.trim()), JSON.stringify(dataToSave))

        // 4. 计算转盘动画
        const degreesPerSlice = 360 / PRIZES.length
        const pointerOffset = 30
        const baseRotation = -(targetIdx + 0.5) * degreesPerSlice + pointerOffset
        const randomSpins = 360 * (8 + Math.floor(Math.random() * 5))
        const finalRotation = randomSpins + baseRotation
        setRotation(finalRotation)

        // 5. 动画结束后显示结果
        setTimeout(() => {
            setIsSpinning(false)
            setShowResult(true)
        }, 8000)
    }

    const getCoordinatesForPercent = (percent: number) => {
        const x = Math.cos(2 * Math.PI * percent)
        const y = Math.sin(2 * Math.PI * percent)
        return [x, y]
    }

    return (
        <>
            {/* 左下角小礼包按钮 */}
            {!isVisible && (
                <button
                    onClick={() => { setIsVisible(true); setRegError("") }}
                    className="fixed bottom-6 left-6 sm:bottom-8 sm:left-8 z-[9998] w-12 h-12 sm:w-14 sm:h-14 bg-black text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95 group"
                >
                    <span className="absolute inset-0 rounded-full bg-black animate-ping opacity-20"></span>
                    <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                    {showResult && (
                        <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-orange-500 rounded-full border-2 border-white"></span>
                    )}
                </button>
            )}

            {isVisible && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none p-4 animate-in fade-in duration-300 backdrop-blur-sm">
                    <div className="relative bg-white border border-black/10 shadow-[0_45px_100px_-20px_rgba(0,0,0,0.25)] rounded-[2.5rem] max-w-[720px] w-full pointer-events-auto animate-in zoom-in-95 duration-500 max-h-[90vh] flex flex-col">

                        {/* 关闭按钮 — 固定在容器右上角，不随内容滚动 */}
                        <button onClick={handleClose} className="absolute top-5 right-5 sm:top-6 sm:right-6 text-gray-300 hover:text-black transition-colors z-50 flex-shrink-0">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>

                        {/* 内容滚动区 */}
                        <div className="overflow-y-auto overflow-x-hidden p-6 sm:p-8 rounded-[2.5rem]">

                        {!showResult ? (
                            <div className="flex flex-col md:flex-row items-center md:items-center gap-6 md:gap-10">
                                {/* 左侧：轮盘 */}
                                <div className="relative w-60 h-60 sm:w-72 sm:h-72 shrink-0 mx-auto md:mx-0">
                                    {/* 外圈装饰环 */}
                                    <div className="absolute -inset-3 rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-pink-500 opacity-10 blur-xl"></div>
                                    <div className="absolute -inset-1 rounded-full border-[6px] border-gray-100"></div>

                                    <div className="absolute z-50" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%) rotate(30deg) translateY(-130px)' }}>
                                        <svg width="28" height="36" viewBox="0 0 40 50" className="drop-shadow-lg rotate-180 sm:w-[34px] sm:h-[44px]"><path d="M20 50 L34 15 L20 0 L6 15 Z" fill="#111" /><circle cx="20" cy="45" r="4" fill="#111" /></svg>
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

                                {/* 右侧：表单 */}
                                <div className="flex-1 w-full min-w-0 text-center md:text-left">
                                    <header className="mb-6">
                                        <h2 className="text-3xl sm:text-4xl font-black tracking-tighter uppercase italic leading-none text-black">
                                            Lucky<br className="hidden md:block" /> Spin
                                        </h2>
                                        <p className="text-gray-400 text-[10px] tracking-[0.2em] uppercase font-bold mt-2">
                                            {isLoggedIn ? "Spin to win your reward" : "Register & spin to win"}
                                        </p>
                                    </header>

                                    <div className="space-y-3">
                                        {/* Email */}
                                        <div>
                                            <input
                                                type="email"
                                                placeholder="Email address"
                                                className={`w-full rounded-xl py-3.5 px-5 text-sm font-medium transition-all disabled:bg-gray-100 disabled:text-gray-400 placeholder:text-gray-300 ${
                                                    touched.email && fieldErrors.email
                                                        ? "bg-red-50 border-2 border-red-300 focus:ring-red-200"
                                                        : "bg-gray-50 border-2 border-transparent focus:bg-white focus:ring-2 focus:ring-black/10"
                                                }`}
                                                value={email}
                                                onChange={(e) => {
                                                    setEmail(e.target.value)
                                                    if (touched.email) validateField("email", e.target.value)
                                                }}
                                                onBlur={() => handleBlur("email", email)}
                                                disabled={isSpinning || isRegistering || isLoggedIn}
                                            />
                                            {touched.email && fieldErrors.email && (
                                                <p className="text-red-500 text-[10px] font-medium mt-1 ml-2">{fieldErrors.email}</p>
                                            )}
                                        </div>

                                        {!isLoggedIn && (
                                            <>
                                                {/* Password */}
                                                <div>
                                                    <input
                                                        type="password"
                                                        placeholder="Password (6+ chars, letters + numbers)"
                                                        className={`w-full rounded-xl py-3.5 px-5 text-sm font-medium transition-all placeholder:text-gray-300 ${
                                                            touched.password && fieldErrors.password
                                                                ? "bg-red-50 border-2 border-red-300 focus:ring-red-200"
                                                                : "bg-gray-50 border-2 border-transparent focus:bg-white focus:ring-2 focus:ring-black/10"
                                                        }`}
                                                        value={password}
                                                        onChange={(e) => {
                                                            setPassword(e.target.value)
                                                            if (touched.password) validateField("password", e.target.value)
                                                        }}
                                                        onBlur={() => handleBlur("password", password)}
                                                        disabled={isSpinning || isRegistering}
                                                    />
                                                    {touched.password && fieldErrors.password && (
                                                        <p className="text-red-500 text-[10px] font-medium mt-1 ml-2">{fieldErrors.password}</p>
                                                    )}
                                                </div>
                                                <div className="flex gap-3">
                                                    {/* First Name */}
                                                    <div className="flex-1">
                                                        <input
                                                            type="text"
                                                            placeholder="First name"
                                                            className={`w-full rounded-xl py-3.5 px-5 text-sm font-medium transition-all placeholder:text-gray-300 ${
                                                                touched.firstName && fieldErrors.firstName
                                                                    ? "bg-red-50 border-2 border-red-300 focus:ring-red-200"
                                                                    : "bg-gray-50 border-2 border-transparent focus:bg-white focus:ring-2 focus:ring-black/10"
                                                            }`}
                                                            value={firstName}
                                                            onChange={(e) => {
                                                                setFirstName(e.target.value)
                                                                if (touched.firstName) validateField("firstName", e.target.value)
                                                            }}
                                                            onBlur={() => handleBlur("firstName", firstName)}
                                                            disabled={isSpinning || isRegistering}
                                                        />
                                                        {touched.firstName && fieldErrors.firstName && (
                                                            <p className="text-red-500 text-[10px] font-medium mt-1 ml-2">{fieldErrors.firstName}</p>
                                                        )}
                                                    </div>
                                                    {/* Last Name */}
                                                    <div className="flex-1">
                                                        <input
                                                            type="text"
                                                            placeholder="Last name"
                                                            className={`w-full rounded-xl py-3.5 px-5 text-sm font-medium transition-all placeholder:text-gray-300 ${
                                                                touched.lastName && fieldErrors.lastName
                                                                    ? "bg-red-50 border-2 border-red-300 focus:ring-red-200"
                                                                    : "bg-gray-50 border-2 border-transparent focus:bg-white focus:ring-2 focus:ring-black/10"
                                                            }`}
                                                            value={lastName}
                                                            onChange={(e) => {
                                                                setLastName(e.target.value)
                                                                if (touched.lastName) validateField("lastName", e.target.value)
                                                            }}
                                                            onBlur={() => handleBlur("lastName", lastName)}
                                                            disabled={isSpinning || isRegistering}
                                                        />
                                                        {touched.lastName && fieldErrors.lastName && (
                                                            <p className="text-red-500 text-[10px] font-medium mt-1 ml-2">{fieldErrors.lastName}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {regError && (
                                            <p className="text-red-500 text-[11px] font-bold uppercase tracking-wide bg-red-50 rounded-xl py-2.5 px-4">{regError}</p>
                                        )}

                                        <button
                                            onClick={startSpin}
                                            disabled={isSpinning || isRegistering || !email}
                                            className="w-full bg-black text-white py-4 rounded-full font-black uppercase text-sm tracking-wider shadow-xl active:scale-95 transition-all disabled:opacity-40 hover:bg-gray-900"
                                        >
                                            {isRegistering ? "Registering..." : isSpinning ? "Spinning..." : isLoggedIn ? "Spin Now" : "Register & Spin"}
                                        </button>

                                        {!isLoggedIn && (
                                            <p className="text-gray-400 text-[10px] leading-relaxed text-center">
                                                By registering you agree to our{" "}
                                                <a href="/us/pages/PrivacyPolicy" className="underline hover:text-black">Privacy Policy</a>
                                                {" & "}
                                                <a href="/us/pages/termsandconditions" className="underline hover:text-black">Terms</a>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // --- 结果界面 ---
                            <div className="py-8 sm:py-10 animate-in zoom-in-95 duration-500">
                                <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
                                    {/* 左侧：奖品展示 */}
                                    <div className="shrink-0 text-center md:text-left">
                                        <div className="text-5xl sm:text-6xl text-orange-500 font-black italic leading-none">YOU<br />WON!</div>
                                        <p className="text-gray-400 text-[10px] mt-3 uppercase tracking-widest">Saved for: {email}</p>
                                    </div>

                                    {/* 右侧：优惠码 */}
                                    <div className="flex-1 w-full min-w-0 text-center">
                                        <h2 className="text-xl sm:text-2xl font-black uppercase italic mb-6 leading-none">
                                            {prizeIndex !== null ? PRIZES[prizeIndex].label : ''}
                                        </h2>

                                        <div className="bg-gray-50 border-2 border-dashed border-gray-200 p-6 mb-6 rounded-2xl relative overflow-hidden">
                                            <div className="absolute top-0 right-0 bg-black text-white text-[9px] px-3 py-1.5 font-bold rounded-bl-xl">COUPON CODE</div>
                                            <span className="text-2xl sm:text-3xl font-mono font-black tracking-widest uppercase block">
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
                                            className="w-full bg-black text-white py-4 rounded-full font-black uppercase text-sm tracking-wider shadow-lg hover:bg-gray-900 transition-colors"
                                        >
                                            Copy & Shop Now
                                        </button>

                                        <p className="mt-5 text-gray-400 text-[10px] uppercase tracking-tighter">
                                            * This offer is linked to your email address
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                        </div>{/* 滚动区结束 */}
                    </div>
                </div>
            )}
        </>
    )
}

export default LotteryModal