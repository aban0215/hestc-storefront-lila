"use client"

import { Popover, Transition } from "@headlessui/react"
import { Fragment, useEffect, useMemo, useState, useRef } from "react"
import ReactCountryFlag from "react-country-flag"
import { useRouter } from "next/navigation"
import { updateLocale } from "@lib/data/locale-actions"
import { Locale } from "@lib/data/locales"
import { ChevronDown } from "@medusajs/icons"

// 提取国家代码逻辑
const getCountryCodeFromLocale = (localeCode: string): string => {
    try {
        const locale = new Intl.Locale(localeCode)
        if (locale.region) return locale.region.toUpperCase()
        const maximized = locale.maximize()
        return maximized.region?.toUpperCase() ?? localeCode.toUpperCase()
    } catch {
        const parts = localeCode.split(/[-_]/)
        return parts.length > 1 ? parts[1].toUpperCase() : parts[0].toUpperCase()
    }
}

// 提取本地化语言名称
const getLocalizedLanguageName = (
    code: string,
    fallbackName: string,
    displayLocale: string = "en-US"
): string => {
    try {
        const displayNames = new Intl.DisplayNames([displayLocale], { type: "language" })
        return displayNames.of(code) ?? fallbackName
    } catch {
        return fallbackName
    }
}

type HeaderLanguageSelectProps = {
    locales: Locale[] | null
    currentLocale: string | null
}

const HeaderLanguageSelect = ({ locales, currentLocale }: HeaderLanguageSelectProps) => {
    const [current, setCurrent] = useState<{ code: string; name: string; countryCode: string; localizedName: string } | null>(null)
    const [isUpdating, setIsUpdating] = useState(false)
    const router = useRouter()

    const buttonRef = useRef<HTMLButtonElement>(null)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    const options = useMemo(() => {
        if (!locales) return []
        return locales.map((locale) => ({
            code: locale.code,
            name: locale.name,
            localizedName: getLocalizedLanguageName(locale.code, locale.name, currentLocale ?? "en-US"),
            countryCode: getCountryCodeFromLocale(locale.code),
        }))
    }, [locales, currentLocale])

    useEffect(() => {
        if (currentLocale && options.length > 0) {
            const option = options.find((o) => o.code.toLowerCase() === currentLocale.toLowerCase())
            setCurrent(option || options[0])
        } else if (options.length > 0) {
            setCurrent(options[0])
        }
    }, [options, currentLocale])

    const FlagIcon = ({ code }: { code: string }) => (
        <div
            className="relative flex-shrink-0 bg-ui-bg-subtle rounded-[2px] overflow-hidden"
            style={{
                width: '20px',
                height: '15px',
            }}
        >
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

    const handleChange = async (option: any, close: () => void) => {
        if (isUpdating) return

        setIsUpdating(true)
        try {
            await updateLocale(option.code)
            close()

            if (typeof window !== "undefined") {
                window.dispatchEvent(new Event("locale-changed"))
            }

            router.refresh()
        } catch (error) {
            console.error("Failed to update locale:", error)
        } finally {
            setIsUpdating(false)
        }
    }

    return (
        <Popover className="relative inline-block w-full sm:w-auto">
            {({ open, close }) => (
                <div
                    className="relative w-full"
                    onMouseEnter={() => handleMouseEnter(open)}
                    onMouseLeave={() => handleMouseLeave(open, close)}
                >
                    <Popover.Button
                        ref={buttonRef}
                        onClick={(e) => {
                            e.stopPropagation()
                        }}
                        className={`flex items-center gap-x-2 text-ui-fg-subtle hover:text-ui-fg-base transition-all py-1.5 px-3 rounded-md w-full sm:min-w-[100px] outline-none ${
                            open ? 'bg-ui-bg-subtle-hover text-ui-fg-base' : ''
                        }`}
                    >
                        {current ? (
                            <>
                                <FlagIcon code={current.countryCode} />
                                <span className="text-sm font-bold whitespace-nowrap">
                                    {current.localizedName.split(' ')[0]}
                                </span>
                            </>
                        ) : (
                            <span className="text-sm font-medium">Select</span>
                        )}
                        <ChevronDown className={`h-4 w-4 ml-auto transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
                    </Popover.Button>

                    <Transition
                        as={Fragment}
                        enter="transition duration-100 ease-out"
                        enterFrom="opacity-0 translate-y-[-8px]"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition duration-75 ease-in"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 translate-y-[-8px]"
                    >
                        <Popover.Panel
                            /**
                             * 核心修改：
                             * 1. relative sm:absolute -> 移动端撑开容器，PC端悬浮。
                             * 2. w-full sm:w-[240px] -> 移动端宽度自适应。
                             * 3. 移除 overflow-hidden -> 防止阴影或内容被切断。
                             */
                            className="relative sm:absolute right-0 z-[110] mt-2 w-full sm:w-[240px] origin-top-right bg-white rounded-lg shadow-xl ring-1 ring-black/5 focus:outline-none"
                        >
                            {/* PC端连接层 */}
                            <div className="hidden sm:block absolute -top-2 h-2 w-full bg-transparent" />

                            <div className="flex flex-col w-full">
                                <div className="sticky top-0 z-10 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-ui-fg-muted border-b bg-gray-50/95 backdrop-blur-sm">
                                    Select Language
                                </div>

                                {/* 滚动列表高度限制 */}
                                <div
                                    className="max-h-[240px] sm:max-h-80 overflow-y-auto overscroll-contain p-1 custom-scrollbar"
                                    style={{ WebkitOverflowScrolling: 'touch' }}
                                >
                                    {options.map((option) => (
                                        <button
                                            key={option.code}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleChange(option, close);
                                            }}
                                            disabled={isUpdating}
                                            className={`flex items-center w-full px-3 py-2.5 text-sm rounded-md transition-all ${
                                                current?.code === option.code
                                                    ? "bg-ui-bg-base-pressed text-ui-fg-base font-semibold"
                                                    : "text-ui-fg-subtle hover:bg-ui-bg-base-hover hover:text-ui-fg-base"
                                            } ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
                                        >
                                            <FlagIcon code={option.countryCode} />
                                            <span className="ml-3 truncate text-left flex-1">{option.localizedName}</span>
                                            {current?.code === option.code && (
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

export default HeaderLanguageSelect