"use client"

import { Popover, Transition } from "@headlessui/react"
import { Fragment, useEffect, useMemo, useState, useTransition, useRef } from "react"
import ReactCountryFlag from "react-country-flag"
import { useRouter } from "next/navigation"
import { updateLocale } from "@lib/data/locale-actions"
import { Locale } from "@lib/data/locales"
import { ChevronDown } from "@medusajs/icons"

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
    const [isPending, startTransition] = useTransition()
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

    const handleMouseEnter = (open: boolean) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        if (!open) {
            buttonRef.current?.click()
        }
    }

    const handleMouseLeave = (open: boolean, close: () => void) => {
        timeoutRef.current = setTimeout(() => {
            if (open) close()
        }, 150)
    }

    const handleChange = (option: any, close: () => void) => {
        startTransition(async () => {
            await updateLocale(option.code)
            close()
            if (typeof window !== "undefined") {
                window.dispatchEvent(new Event("locale-changed"))
            }
            router.refresh()
        })
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
                        className={`flex items-center gap-x-2 text-ui-fg-subtle hover:text-ui-fg-base transition-all py-1.5 px-3 rounded-md min-w-[100px] outline-none ${
                            open ? 'bg-ui-bg-subtle-hover text-ui-fg-base' : ''
                        }`}
                    >
                        {current ? (
                            <>
                                <ReactCountryFlag
                                    svg
                                    style={{ width: "18px", height: "18px", borderRadius: "2px" }}
                                    countryCode={current.countryCode}
                                />
                                <span className="text-sm font-medium whitespace-nowrap">
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
                            {/* 隐形连接层：让鼠标从按钮滑动到菜单时不会断开 */}
                            <div className="absolute -top-2 left-0 right-0 h-2 bg-transparent" />

                            <div className="max-h-80 overflow-y-auto">
                                <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-ui-fg-muted border-b bg-ui-bg-subtle/50">
                                    Select Language
                                </div>
                                <div className="p-1">
                                    {options.map((option) => (
                                        <button
                                            key={option.code}
                                            onClick={() => handleChange(option, close)}
                                            disabled={isPending}
                                            className={`flex items-center w-full px-3 py-2.5 text-sm rounded-md transition-colors ${
                                                current?.code === option.code
                                                    ? "bg-ui-bg-base-pressed text-ui-fg-base font-medium"
                                                    : "text-ui-fg-subtle hover:bg-ui-bg-base-hover hover:text-ui-fg-base"
                                            } ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
                                        >
                                            <ReactCountryFlag
                                                svg
                                                style={{ width: "18px", height: "18px", marginRight: "10px", flexShrink: 0, borderRadius: "2px" }}
                                                countryCode={option.countryCode}
                                            />
                                            <span className="truncate pr-4">{option.localizedName}</span>
                                            {current?.code === option.code && (
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

export default HeaderLanguageSelect