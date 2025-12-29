"use client"

import useToggleState from "@lib/hooks/use-toggle-state"
import CountrySelect from "@modules/layout/components/country-select"
import LanguageSelect from "@modules/layout/components/language-select"
import { HttpTypes } from "@medusajs/types"
import { Locale } from "@lib/data/locales"

const HeaderSelector = ({
                            regions,
                            locales,
                            currentLocale
                        }: {
    regions: HttpTypes.StoreRegion[],
    locales: Locale[],
    currentLocale: string | null
}) => {
    const countryToggle = useToggleState()
    const langToggle = useToggleState()

    return (
        <div className="hidden small:flex items-center gap-x-4 h-full">
            {/* 国家选择器：添加点击事件手动触发 open */}
            <div className="relative header-select-wrapper" onClick={countryToggle.open}>
                <CountrySelect regions={regions} toggleState={countryToggle} />
            </div>

            <span className="h-4 w-px bg-gray-300" />

            {/* 语言选择器：添加点击事件手动触发 open */}
            {locales && locales.length > 0 && (
                <div className="relative header-select-wrapper" onClick={langToggle.open}>
                    <LanguageSelect
                        locales={locales}
                        currentLocale={currentLocale}
                        toggleState={langToggle}
                    />
                </div>
            )}

            <style jsx global>{`
        /* 强制下拉框向下弹出 */
        .header-select-wrapper [role="listbox"] {
          top: 40px !important; /* 调整具体高度 */
          bottom: auto !important;
          margin-top: 0px;
          min-width: 160px !important;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }
      `}</style>
        </div>
    )
}

export default HeaderSelector