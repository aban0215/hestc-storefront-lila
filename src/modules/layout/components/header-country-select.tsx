"use client"

import { Popover, Transition } from "@headlessui/react"
import { Fragment, useEffect, useMemo, useState, useRef } from "react"
import ReactCountryFlag from "react-country-flag"
import { useParams, usePathname } from "next/navigation"
import { updateRegion } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { ChevronDown } from "@medusajs/icons"

type CountryOption = {
    country: string
    region: string
    label: string
}

type HeaderCountrySelectProps = {
    regions: HttpTypes.StoreRegion[] | null
}

const HeaderCountrySelect = ({ regions }: HeaderCountrySelectProps) => {
    const [current, setCurrent] = useState<CountryOption | undefined>(undefined)
    const [isUpdating, setIsUpdating] = useState(false)
    const { countryCode } = useParams()
    const currentPath = usePathname().split(`/${countryCode}`)[1] || ""
    const buttonRef = useRef<HTMLButtonElement>(null)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    const options = useMemo(() => {
        return regions
            ?.flatMap((r) =>
                r.countries?.map((c) => ({
                    country: c.iso_2,
                    region: r.id,
                    label: c.display_name,
                })) || []
            )
            .filter((o): o is CountryOption => !!o)
            .sort((a, b) => a.label.localeCompare(b.label))
    }, [regions])

    useEffect(() => {
        if (!options?.length) return
        const selected = countryCode
            ? options.find((o) => o.country === countryCode)
            : options[0]
        if (selected) setCurrent(selected)
    }, [options, countryCode])

    const FlagIcon = ({ code }: { code: string }) => (
        <div
            className="relative flex-shrink-0 bg-ui-bg-subtle rounded-[2px] overflow-hidden"
            style={{
                width: "20px",
                height: "15px",
            }}
        >
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            <ReactCountryFlag
                svg
                countryCode={code}
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                }}
            />
        </div>
    )

    const handleMouseEnter = (open: boolean) => {
        if (
            typeof window !== "undefined" &&
            window.matchMedia("(pointer: fine)").matches
        ) {
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
            if (!open) buttonRef.current?.click()
        }
    }

    const handleMouseLeave = (open: boolean, close: () => void) => {
        if (
            typeof window !== "undefined" &&
            window.matchMedia("(pointer: fine)").matches
        ) {
            timeoutRef.current = setTimeout(() => {
                if (open) close()
            }, 200)
        }
    }

    const handleChange = async (option: CountryOption, close: () => void) => {
        if (isUpdating) return

        setIsUpdating(true)
        try {
            close()
            await updateRegion(option.country, currentPath)
        } catch (error) {
            console.error("Failed to update region:", error)
        } finally {
            setIsUpdating(false)
        }
    }

    return (
        <Popover className="relative inline-block w-full sm:w-auto">
            {({ open, close }) => (
                <div
                    className="relative"
                    onMouseEnter={() => handleMouseEnter(open)}
                    onMouseLeave={() => handleMouseLeave(open, close)}
                >
                    {/* 修改后的 Popover.Button */}
                    <Popover.Button
                        ref={buttonRef}
                        onClick={(e) => {
                            e.stopPropagation()
                        }}
                        className={`flex items-center gap-x-2 text-ui-fg-subtle hover:text-ui-fg-base transition-all w-full outline-none ${
                            // 关键点：移除 px-3, py-1.5 和 rounded-md
                            open ? "bg-ui-bg-subtle-hover text-ui-fg-base" : ""
                        }`}
                    >
                        {current && <FlagIcon code={current.country} />}
                        <span className="text-[12px] font-bold uppercase tabular-nums tracking-widest">
        {current?.country || "Select"}
    </span>
                        <ChevronDown
                            className={`h-4 w-4 ml-auto transition-transform duration-200 ${
                                open ? "rotate-180" : ""
                            }`}
                        />
                    </Popover.Button>

                    <Transition
                        as={Fragment}
                        enter="transition duration-100 ease-out"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="transition duration-75 ease-in"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <Popover.Panel
                            /**
                             * 核心修复逻辑：
                             * 1. relative sm:absolute -> 手机端相对定位（撑开菜单），PC端绝对定位（悬浮）。
                             * 2. left-0 right-0 -> 手机端全宽显示，防止偏出屏幕。
                             * 3. 去掉 overflow-hidden -> 保证内部自定义滚动条不被切断。
                             */
                            className="relative sm:absolute left-0 right-0 sm:left-auto sm:right-0 z-[110] mt-2 w-full sm:w-[240px] origin-top bg-white rounded-lg shadow-xl ring-1 ring-black/5 focus:outline-none"
                        >
                            {/* 仅在桌面端显示的连接层 */}
                            <div className="hidden sm:block absolute -top-2 h-2 w-full bg-transparent" />

                            <div className="flex flex-col w-full">
                                <div className="sticky top-0 z-10 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-ui-fg-muted border-b bg-gray-50/95 backdrop-blur-sm">
                                    Shipping to
                                </div>

                                {/* 滚动容器：
                                   1. max-h-[240px] -> 严格限制高度，确保在手机菜单中不会顶到底部。
                                   2. -webkit-overflow-scrolling: touch -> 确保 iOS 滚动丝滑。
                                */}
                                <div
                                    className="max-h-[240px] sm:max-h-[40vh] overflow-y-auto overscroll-contain p-1 custom-scrollbar"
                                    style={{ WebkitOverflowScrolling: 'touch' }}
                                >
                                    {options?.map((option) => (
                                        <button
                                            key={option.country}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleChange(option, close)
                                            }}
                                            disabled={isUpdating}
                                            className={`flex items-center w-full px-3 py-2.5 text-sm rounded-md transition-all ${
                                                current?.country === option.country
                                                    ? "bg-ui-bg-base-pressed text-ui-fg-base font-semibold"
                                                    : "text-ui-fg-subtle hover:bg-ui-bg-base-hover hover:text-ui-fg-base"
                                            } ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
                                        >
                                            <FlagIcon code={option.country} />
                                            <span className="ml-3 truncate text-left flex-1">
                                                {option.label}
                                            </span>
                                            {current?.country === option.country && (
                                                <div className="ml-2 w-1.5 h-1.5 rounded-full bg-ui-fg-interactive" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </Popover.Panel>
                    </Transition>
                </div>
            )}
        </Popover>
    )
}

export default HeaderCountrySelect