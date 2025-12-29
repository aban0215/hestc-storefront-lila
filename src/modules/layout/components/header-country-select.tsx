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
    const { countryCode } = useParams()
    const currentPath = usePathname().split(`/${countryCode}`)[1]
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

    // 处理悬停逻辑（仅针对有鼠标的设备）
    const handleMouseEnter = (open: boolean) => {
        if (window.matchMedia("(pointer: fine)").matches) {
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
            if (!open) buttonRef.current?.click()
        }
    }

    const handleMouseLeave = (open: boolean, close: () => void) => {
        if (window.matchMedia("(pointer: fine)").matches) {
            timeoutRef.current = setTimeout(() => {
                if (open) close()
            }, 200)
        }
    }

    const handleChange = (option: CountryOption, close: () => void) => {
        close()
        updateRegion(option.country, currentPath)
    }

    // 核心修复：固定比例的国旗渲染器
    const FlagIcon = ({ code }: { code: string }) => (
        <div
            className="relative flex-shrink-0 bg-ui-bg-subtle rounded-[2px] overflow-hidden"
            style={{
                width: '20px',
                height: '15px',
                aspectRatio: '4/3' // 强制比例
            }}
        >
            {/* 骨架屏占位图层：在图片加载前显示灰色块 */}
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />

            <ReactCountryFlag
                svg
                countryCode={code}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block'
                }}
            />
        </div>
    )

    return (
        <Popover className="relative inline-block">
            {({ open, close }) => (
                <div
                    className="relative"
                    onMouseEnter={() => handleMouseEnter(open)}
                    onMouseLeave={() => handleMouseLeave(open, close)}
                >
                    <Popover.Button
                        ref={buttonRef}
                        className={`flex items-center gap-x-2 text-ui-fg-subtle hover:text-ui-fg-base transition-all py-1.5 px-3 rounded-md outline-none min-w-[80px] ${
                            open ? 'bg-ui-bg-subtle-hover text-ui-fg-base' : ''
                        }`}
                    >
                        {current && <FlagIcon code={current.country} />}
                        <span className="text-sm font-bold uppercase tabular-nums">
                            {current?.country || "Select"}
                        </span>
                        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
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
                            className="absolute right-0 z-[100] mt-2 w-[240px] origin-top-right overflow-hidden bg-white rounded-lg shadow-xl ring-1 ring-black/5 focus:outline-none"
                        >
                            <div className="absolute -top-2 h-2 w-full bg-transparent" />
                            <div className="max-h-[60vh] overflow-y-auto overscroll-contain">
                                <div className="sticky top-0 z-10 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-ui-fg-muted border-b bg-gray-50/95 backdrop-blur-sm">
                                    Shipping to
                                </div>
                                <div className="p-1">
                                    {options?.map((option) => (
                                        <button
                                            key={option.country}
                                            onClick={() => handleChange(option, close)}
                                            className={`flex items-center w-full px-3 py-2.5 text-sm rounded-md transition-colors ${
                                                current?.country === option.country
                                                    ? "bg-ui-bg-base-pressed text-ui-fg-base font-semibold"
                                                    : "text-ui-fg-subtle hover:bg-ui-bg-base-hover hover:text-ui-fg-base"
                                            }`}
                                        >
                                            <FlagIcon code={option.country} />
                                            <span className="ml-3 truncate text-left flex-1">{option.label}</span>
                                            {current?.country === option.country && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-ui-fg-interactive" />
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