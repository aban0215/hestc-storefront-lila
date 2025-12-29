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

    // 用于悬停控制的 Ref
    const buttonRef = useRef<HTMLButtonElement>(null)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    const options = useMemo(() => {
        return regions
            ?.map((r) => {
                return r.countries?.map((c) => ({
                    country: c.iso_2,
                    region: r.id,
                    label: c.display_name,
                }))
            })
            .flat()
            .sort((a, b) => (a?.label ?? "").localeCompare(b?.label ?? ""))
    }, [regions])

    useEffect(() => {
        if (countryCode && options) {
            const option = options.find((o) => o?.country === countryCode)
            setCurrent(option)
        }
    }, [options, countryCode])

    // 处理鼠标移入：清除关闭定时器并打开菜单
    const handleMouseEnter = (open: boolean) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        if (!open) {
            buttonRef.current?.click()
        }
    }

    // 处理鼠标移出：设置延迟关闭
    const handleMouseLeave = (open: boolean, close: () => void) => {
        timeoutRef.current = setTimeout(() => {
            if (open) close()
        }, 150)
    }

    const handleChange = (option: CountryOption, close: () => void) => {
        close()
        updateRegion(option.country, currentPath)
    }

    return (
        <Popover className="relative inline-block">
            {({ open, close }) => (
                <div
                    className="relative"
                    onMouseEnter={() => handleMouseEnter(open)}
                    onMouseLeave={() => handleMouseLeave(open, close)}
                >
                    <Popover.Panel
                        static
                        className="absolute right-0 z-[100] mt-1.5 w-max min-w-full origin-top-right overflow-hidden bg-white rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none"
                    >
                        {/* 隐形连接层 */}
                        <div className="absolute -top-2 left-0 right-0 h-2 bg-transparent" />

                        {/* 核心修改点：限制最大高度并允许内部滚动 */}
                        <div className="max-h-[300px] overflow-y-auto overscroll-contain custom-scrollbar">
                            <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-ui-fg-muted border-b bg-ui-bg-subtle/50 sticky top-0 bg-white z-10">
                                Select Country/Region
                            </div>
                            <div className="p-1">
                                {options?.map((option, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleChange(option!, close)}
                                        className={`flex items-center w-full px-3 py-2.5 text-sm rounded-md transition-colors ${
                                            current?.country === option?.country
                                                ? "bg-ui-bg-base-pressed text-ui-fg-base font-medium"
                                                : "text-ui-fg-subtle hover:bg-ui-bg-base-hover hover:text-ui-fg-base"
                                        }`}
                                    >
                                        <ReactCountryFlag
                                            svg
                                            style={{
                                                width: "18px",
                                                height: "18px",
                                                marginRight: "10px",
                                                flexShrink: 0,
                                                borderRadius: "2px"
                                            }}
                                            countryCode={option?.country ?? ""}
                                        />
                                        <span className="truncate pr-4">{option?.label}</span>
                                        {current?.country === option?.country && (
                                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-ui-fg-interactive" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </Popover.Panel>

                    <Transition
                        as={Fragment}
                        show={open}
                        enter="transition duration-100 ease-out"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition duration-75 ease-in"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                    >
                        <Popover.Panel
                            static
                            className="absolute right-0 z-50 mt-1.5 w-max min-w-full origin-top-right overflow-hidden bg-white rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none"
                        >
                            {/* 隐形连接层：确保鼠标移动到面板时不会因为间隙触发关闭 */}
                            <div className="absolute -top-2 left-0 right-0 h-2 bg-transparent" />

                            <div className="max-h-80 overflow-y-auto">
                                <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-ui-fg-muted border-b bg-ui-bg-subtle/50">
                                    Select Country/Region
                                </div>
                                <div className="p-1">
                                    {options?.map((option, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleChange(option!, close)}
                                            className={`flex items-center w-full px-3 py-2.5 text-sm rounded-md transition-colors ${
                                                current?.country === option?.country
                                                    ? "bg-ui-bg-base-pressed text-ui-fg-base font-medium"
                                                    : "text-ui-fg-subtle hover:bg-ui-bg-base-hover hover:text-ui-fg-base"
                                            }`}
                                        >
                                            <ReactCountryFlag
                                                svg
                                                style={{
                                                    width: "18px",
                                                    height: "18px",
                                                    marginRight: "10px",
                                                    flexShrink: 0,
                                                    borderRadius: "2px"
                                                }}
                                                countryCode={option?.country ?? ""}
                                            />
                                            <span className="truncate pr-4">{option?.label}</span>
                                            {current?.country === option?.country && (
                                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-ui-fg-interactive" />
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