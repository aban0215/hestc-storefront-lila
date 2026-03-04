"use client"

import { Dialog, Transition } from "@headlessui/react"
import { HttpTypes } from "@medusajs/types"
import { Button, clx } from "@medusajs/ui"
import React, { Fragment, useMemo } from "react"
import OptionSelect from "./option-select"
import useToggleState from "@lib/hooks/use-toggle-state";

type MobileActionsProps = {
    product: HttpTypes.StoreProduct
    variant: HttpTypes.StoreProductVariant | undefined
    options: Record<string, string | undefined>
    updateOptions: (name: string, value: string) => void
    inStock: boolean
    handleAddToCart: () => Promise<void>
    handleBuyNow?: () => Promise<void> // 大哥加的
    isAdding: boolean
    isBuying?: boolean                 // 大哥加的
    show: boolean
    optionsDisabled: boolean
}

const MobileActions: React.FC<MobileActionsProps> = ({
                                                         product,
                                                         variant,
                                                         options,
                                                         updateOptions,
                                                         inStock,
                                                         handleAddToCart,
                                                         handleBuyNow,
                                                         isAdding,
                                                         isBuying,
                                                         show,
                                                         optionsDisabled,
                                                     }) => {
    const { state, open, close } = useToggleState()

    const price = useMemo(() => {
        if (!variant) return null
        return variant.calculated_price?.calculated_amount // 简化处理，实际可能需要转换
    }, [variant])

    return (
        <>
            <Transition
                show={show}
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="translate-y-full"
                enterTo="translate-y-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-y-0"
                leaveTo="translate-y-full"
            >
                {/* 悬浮容器 */}
                <div className="fixed inset-x-0 bottom-0 z-50 bg-white border-t border-gray-200 p-4 pb-6 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] lg:hidden">
                    <div className="flex flex-col gap-y-3">

                        {/* 第一行：选择规格提示（如果没选）或 商品简要信息 */}
                        {!variant && (
                            <div className="flex items-center justify-between mb-1">
                 <span className="text-xs font-medium uppercase tracking-tight text-gray-500">
                    Select options to purchase
                 </span>
                                <button onClick={open} className="text-xs underline font-semibold">
                                    Details
                                </button>
                            </div>
                        )}

                        {/* 第二行：Add to Cart 按钮 */}
                        <Button
                            onClick={handleAddToCart}
                            disabled={!inStock || !variant || optionsDisabled}
                            variant="secondary"
                            className="w-full min-h-[2.75rem] uppercase tracking-widest text-[10px]"
                            isLoading={isAdding}
                        >
                            {!variant ? "Select Variant" : !inStock ? "Out of Stock" : "Add to Cart"}
                        </Button>

                        {/* 第三行：Check Out 按钮（大哥加的悬浮下一行） */}
                        <Button
                            onClick={handleBuyNow}
                            disabled={!inStock || !variant || optionsDisabled}
                            variant="primary"
                            className="w-full min-h-[2.75rem] uppercase tracking-widest text-[10px]"
                            isLoading={isBuying}
                        >
                            Check Out Now
                        </Button>
                    </div>
                </div>
            </Transition>

            {/* 点击详情弹出的规格选择抽屉 */}
            <Transition show={state} as={Fragment}>
                <Dialog as="div" className="relative z-[100] lg:hidden" onClose={close}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-25" />
                    </Transition.Child>

                    <div className="fixed inset-0 flex">
                        <Transition.Child
                            as={Fragment}
                            enter="transition ease-in-out duration-300 transform"
                            enterFrom="translate-y-full"
                            enterTo="translate-y-0"
                            leave="transition ease-in-out duration-300 transform"
                            leaveFrom="translate-y-0"
                            leaveTo="translate-y-full"
                        >
                            <Dialog.Panel className="relative mt-auto flex w-full flex-col bg-white p-6 rounded-t-2xl shadow-xl">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-bold uppercase tracking-widest">Options</h2>
                                    <button onClick={close} className="text-gray-400 text-sm">Close</button>
                                </div>

                                <div className="flex flex-col gap-y-6 overflow-y-auto max-h-[50vh]">
                                    {(product.options || []).map((option) => (
                                        <div key={option.id}>
                                            <OptionSelect
                                                option={option}
                                                current={options[option.id]}
                                                updateOption={updateOptions}
                                                title={option.title ?? ""}
                                                disabled={optionsDisabled}
                                            />
                                        </div>
                                    ))}
                                </div>

                                <Button
                                    onClick={close}
                                    className="mt-8 w-full"
                                    variant="primary"
                                >
                                    Confirm
                                </Button>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition>
        </>
    )
}

export default MobileActions