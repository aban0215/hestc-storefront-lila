import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import React from "react"

type OptionSelectProps = {
    option: HttpTypes.StoreProductOption
    current: string | undefined
    updateOption: (title: string, value: string) => void
    title: string
    disabled: boolean
    "data-testid"?: string
}

const OptionSelect: React.FC<OptionSelectProps> = ({
                                                       option,
                                                       current,
                                                       updateOption,
                                                       title,
                                                       "data-testid": dataTestId,
                                                       disabled,
                                                   }) => {
    const filteredOptions = (option.values ?? []).map((v) => v.value)

    return (
        <div className="flex flex-col gap-y-3">
            <span className="text-sm">Select {title}</span>
            <div
                className="flex flex-wrap gap-2"
                data-testid={dataTestId}
            >
                {filteredOptions.map((v) => {
                    const isSelected = v === current

                    return (
                        <button
                            onClick={() => updateOption(option.id, v)}
                            key={v}
                            className={clx(
                                "border text-small-regular rounded-lg px-3 py-1.5 min-w-0",
                                "max-w-full truncate transition-all duration-150",
                                {
                                    "border-ui-border-interactive bg-ui-bg-interactive text-ui-fg-interactive":
                                    isSelected,
                                    "border-ui-border-base bg-ui-bg-subtle text-ui-fg-base hover:bg-ui-bg-subtle-hover":
                                        !isSelected && !disabled,
                                    "border-ui-border-base bg-ui-bg-disabled text-ui-fg-disabled cursor-not-allowed":
                                    disabled,
                                }
                            )}
                            disabled={disabled}
                            data-testid="option-button"
                            style={{
                                minWidth: '80px',
                                maxWidth: '120px',
                                flex: '0 0 auto' // 防止按钮拉伸
                            }}
                        >
              <span className="truncate block text-sm" title={v}>
                {v}
              </span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

export default OptionSelect