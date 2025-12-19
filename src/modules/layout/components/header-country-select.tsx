"use client"

import { Popover, Transition } from "@headlessui/react"
import { Fragment, useEffect, useMemo, useState } from "react"
import ReactCountryFlag from "react-country-flag"
import { useParams, usePathname } from "next/navigation"
import { updateRegion } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { ChevronDown } from "@medusajs/icons" // 改为 ChevronDown

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

    const handleChange = (option: CountryOption) => {
        updateRegion(option.country, currentPath)
    }

    return (
        <Popover className="relative">
            {({ open }) => (
                <>
                    <Popover.Button className="flex items-center gap-x-1.5 text-ui-fg-subtle hover:text-ui-fg-base transition-colors py-1 px-3 rounded-md hover:bg-ui-bg-subtle-hover min-w-[70px]">
                        {current ? (
                            <>
                                <ReactCountryFlag
                                    svg
                                    style={{ width: "20px", height: "20px" }}
                                    countryCode={current.country}
                                />
                                <span className="text-sm font-medium hidden sm:inline whitespace-nowrap">
                  {current.country}
                </span>
                                <ChevronDown className={`h-4 w-4 ml-1 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
                            </>
                        ) : (
                            <>
                                <span className="text-sm font-medium">Country</span>
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
                        <Popover.Panel className="absolute right-0 z-10 mt-2 w-64 max-h-80 overflow-y-auto bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <div className="py-1">
                                <div className="px-4 py-2 text-xs text-ui-fg-muted border-b">
                                    Select Country/Region
                                </div>
                                {options?.map((option, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleChange(option!)}
                                        className={`flex items-center w-full px-4 py-3 text-sm text-left hover:bg-ui-bg-base-hover ${
                                            current?.country === option?.country
                                                ? "bg-ui-bg-base-pressed"
                                                : ""
                                        }`}
                                    >
                                        <ReactCountryFlag
                                            svg
                                            style={{
                                                width: "20px",
                                                height: "20px",
                                                marginRight: "12px",
                                                flexShrink: 0
                                            }}
                                            countryCode={option?.country ?? ""}
                                        />
                                        <span className="truncate">{option?.label}</span>
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

export default HeaderCountrySelect