"use client"

import { Popover, Transition } from "@headlessui/react"
import { Fragment, useEffect, useMemo, useState, useTransition } from "react"
import ReactCountryFlag from "react-country-flag"
import { useRouter } from "next/navigation"
import { updateLocale } from "@lib/data/locale-actions"
import { Locale } from "@lib/data/locales"
import { ChevronDown } from "@medusajs/icons" // 改为 ChevronDown

const getCountryCodeFromLocale = (localeCode: string): string => {
    try {
        const locale = new Intl.Locale(localeCode)
        if (locale.region) {
            return locale.region.toUpperCase()
        }
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
        const displayNames = new Intl.DisplayNames([displayLocale], {
            type: "language",
        })
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

    const options = useMemo(() => {
        if (!locales) return []

        return locales.map((locale) => ({
            code: locale.code,
            name: locale.name,
            localizedName: getLocalizedLanguageName(
                locale.code,
                locale.name,
                currentLocale ?? "en-US"
            ),
            countryCode: getCountryCodeFromLocale(locale.code),
        }))
    }, [locales, currentLocale])

    useEffect(() => {
        if (currentLocale && options.length > 0) {
            const option = options.find(
                (o) => o.code.toLowerCase() === currentLocale.toLowerCase()
            )
            setCurrent(option || options[0])
        } else if (options.length > 0) {
            setCurrent(options[0])
        }
    }, [options, currentLocale])

    const handleChange = (option: { code: string; name: string; countryCode: string; localizedName: string }) => {
        startTransition(async () => {
            await updateLocale(option.code)
            router.refresh()
        })
    }

    return (
        <Popover className="relative">
            {({ open }) => (
                <>
                    <Popover.Button className="flex items-center gap-x-1.5 text-ui-fg-subtle hover:text-ui-fg-base transition-colors py-1 px-3 rounded-md hover:bg-ui-bg-subtle-hover min-w-[75px]">
                        {current ? (
                            <>
                                {current.countryCode && (
                                    <ReactCountryFlag
                                        svg
                                        style={{ width: "20px", height: "20px" }}
                                        countryCode={current.countryCode}
                                    />
                                )}
                                <span className="text-sm font-medium hidden sm:inline whitespace-nowrap">
                  {current.localizedName.split(' ')[0]}
                </span>
                                <ChevronDown className={`h-4 w-4 ml-1 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
                            </>
                        ) : (
                            <>
                                <span className="text-sm font-medium">Lang</span>
                                <ChevronDown className={`h-4 w-4 ml-1 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
                            </>
                        )}
                    </Popover.Button>

                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="opacity-0 translate-y-1"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition ease-in duration-150"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 translate-y-1"
                    >
                        <Popover.Panel className="absolute right-0 z-10 mt-2 w-56 max-h-80 overflow-y-auto bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <div className="py-1">
                                <div className="px-4 py-2 text-xs text-ui-fg-muted border-b">
                                    Select Language
                                </div>
                                {options.map((option) => (
                                    <button
                                        key={option.code}
                                        onClick={() => handleChange(option)}
                                        disabled={isPending}
                                        className={`flex items-center w-full px-4 py-3 text-sm text-left hover:bg-ui-bg-base-hover disabled:opacity-50 ${
                                            current?.code === option.code
                                                ? "bg-ui-bg-base-pressed"
                                                : ""
                                        }`}
                                    >
                                        {option.countryCode && (
                                            <ReactCountryFlag
                                                svg
                                                style={{
                                                    width: "20px",
                                                    height: "20px",
                                                    marginRight: "12px",
                                                    flexShrink: 0
                                                }}
                                                countryCode={option.countryCode}
                                            />
                                        )}
                                        <span className="truncate">{option.localizedName}</span>
                                    </button>
                                ))}
                            </div>
                        </Popover.Panel>
                    </Transition>
                </>
            )}
        </Popover>
    )
}

export default HeaderLanguageSelect