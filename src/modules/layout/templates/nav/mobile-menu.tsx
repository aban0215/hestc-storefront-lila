"use client"

import { Popover, Transition } from "@headlessui/react"
import { Fragment, useEffect, useMemo, useState, useRef } from "react"
import ReactCountryFlag from "react-country-flag"
import { useParams, usePathname } from "next/navigation"
import { updateRegion } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { ChevronDown, MagnifyingGlassMini } from "@medusajs/icons"

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
    const [searchTerm, setSearchTerm] = useState("")
    const { countryCode } = useParams()
    const currentPath = usePathname().split(`/${countryCode}`)[1] || ""
    const buttonRef = useRef<HTMLButtonElement>(null)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    const allOptions = useMemo(() => {
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

    // 搜索过滤后的选项
    const filteredOptions = useMemo(() => {
        if (!searchTerm) return allOptions
        return allOptions?.filter(
            (o) =>
                o.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                o.country.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }, [allOptions, searchTerm])

    useEffect(() => {
        if (!allOptions?.length) return
        const selected = countryCode
            ? allOptions.find((o) => o.country === countryCode)
            : allOptions[0]
        if (selected) setCurrent(selected)
    }, [allOptions, countryCode])

    const FlagIcon = ({ code }: { code: string }) => (
        <div
            className="relative flex-shrink-0 bg-ui-bg-subtle rounded-[2px] overflow-hidden"
            style={{ width: '20px', height: '15px' }}
        >
            <ReactCountryFlag
                svg
                countryCode={code}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                }}
            />
        </div>
    )

    const handleMouseEnter = (open: boolean) => {
        if (typeof window !== 'undefined' && window.matchMedia("(pointer: fine)").matches) {
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
            if (!open) buttonRef.current?.click()
        }
    }

    const handleMouseLeave = (open: boolean, close: () => void) => {
        if (typeof window !== 'undefined' && window.matchMedia("(pointer: fine)").matches) {
            timeoutRef.current = setTimeout(() => {
                if (open) close()
            }, 200)
        }
    }

    const handleChange = async (option: CountryOption, close: () => void) => {
        if (isUpdating) return
        setIsUpdating(true)
        try {
            // 在关闭前重置搜索词
            setSearchTerm("")
            close()
            await updateRegion(option.country, currentPath)
        } catch (error) {
            console.error("Failed to update region:", error)
        } finally {
            setIsUpdating(false)
        }
    }

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
                        <ChevronDown className={`h-4 w-4 ml-auto transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
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
                            className="absolute right-0 z-[100] mt-2 w-[280px] origin-top-right bg-white rounded-lg shadow-2xl ring-1 ring-black/5 focus:outline-none overflow-hidden"
                        >
                            {/* 灵活高度容器：最大高度设为视口高度减去 120px 预留给 Header */}
                            <div className="flex flex-col max-h-[calc(100vh-120px)] sm:max-h-[480px]">

                                {/* 顶部标题 */}
                                <div className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-ui-fg-muted border-b bg-gray-50/95 backdrop-blur-sm sticky top-0">
                                    Shipping to
                                </div>

                                {/* 搜索框区域 - 保持固定 */}
                                <div className="p-2 border-b bg-white sticky top-[37px] z-20">
                                    <div className="relative flex items-center">
                                        <MagnifyingGlassMini className="absolute left-2.5 text-ui-fg-muted" />
                                        <input
                                            type="text"
                                            className="w-full pl-8 pr-3 py-1.5 text-sm bg-ui-bg-subtle border-none rounded-md focus:ring-1 focus:ring-ui-border-interactive outline-none"
                                            placeholder="Search country..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                {/* 滚动列表区域 */}
                                <div className="overflow-y-auto overscroll-contain flex-1 p-1 custom-scrollbar">
                                    {filteredOptions?.length ? (
                                        filteredOptions.map((option) => (
                                            <button
                                                key={option.country}
                                                onClick={() => handleChange(option, close)}
                                                disabled={isUpdating}
                                                className={`flex items-center w-full px-3 py-2.5 text-sm rounded-md transition-all ${
                                                    current?.country === option.country
                                                        ? "bg-ui-bg-base-pressed text-ui-fg-base font-semibold"
                                                        : "text-ui-fg-subtle hover:bg-ui-bg-base-hover hover:text-ui-fg-base"
                                                } ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
                                            >
                                                <FlagIcon code={option.country} />
                                                <span className="ml-3 truncate text-left flex-1">{option.label}</span>
                                                {current?.country === option.country && (
                                                    <div className="ml-2 w-1.5 h-1.5 rounded-full bg-pink-500" />
                                                )}
                                            </button>
                                        ))
                                    ) : (
                                        <div className="px-4 py-8 text-center text-sm text-ui-fg-muted">
                                            No countries found
                                        </div>
                                    )}
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