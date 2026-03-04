"use client"

import { Dialog, Transition } from "@headlessui/react"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import React, { Fragment, useMemo } from "react"
import OptionSelect from "./option-select"
import { ChevronDown } from "@medusajs/icons"
import useToggleState from "@lib/hooks/use-toggle-state";

type MobileActionsProps = {
    product: HttpTypes.StoreProduct
    variant: HttpTypes.StoreProductVariant | undefined
    options: Record<string, string | undefined>
    updateOptions: (name: string, value: string) => void
    inStock: boolean
    handleAddToCart: () => Promise<void>
    handleBuyNow?: () => Promise<void>
    isAdding: boolean
    isBuying?: boolean
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

    // 整理当前选中的规格文本，比如 "M / Black"
    const selectedOptionsText = useMemo(() => {
        if (!variant || !variant.options) return "Select Options"
        return variant.options.map(o => o.value).join(" / ")
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
                <div className="fixed inset-x-0 bottom-0 z-50 bg-white border-t border-gray-100 p-4 pb-8 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] lg:hidden">
                    <div className="flex flex-col gap-y-2.5">

                        {/* 第一行：左侧规格选择 + 右侧加购按钮 */}
                        <div className="flex gap-x-2 h-12">
                            {/* 左侧：选规格触发器 - 设为 flex-1 */}
                            <button
                                onClick={open}
                                disabled={optionsDisabled}
                                className="flex-1 flex items-center justify-between px-3 border border-gray-900 rounded-md bg-white active:bg-gray-50 transition-colors"
                            >
                                <div className="flex flex-col items-start overflow-hidden">
                                    <span className="text-[8px] uppercase text-gray-400 font-bold tracking-tighter">Option</span>
                                    <span className="text-[10px] font-bold text-gray-900 truncate w-full text-left uppercase">
                    {selectedOptionsText}
                  </span>
                                </div>
                                <ChevronDown className="text-gray-900 shrink-0" size={14} />
                            </button>

                            {/* 右侧：Add to Cart - 同样设为 flex-1 */}
                            <Button
                                onClick={handleAddToCart}
                                disabled={!inStock || !variant || optionsDisabled}
                                variant="secondary"
                                className="flex-1 h-full uppercase tracking-widest text-[10px] font-bold border-gray-900 text-gray-900 bg-white"
                                isLoading={isAdding}
                            >
                                {!inStock ? "Out of Stock" : "Add to Cart"}
                            </Button>
                        </div>

                        {/* 第二行：Check Out 按钮 (保持满宽) */}
                        <Button
                            onClick={handleBuyNow}
                            disabled={!inStock || !variant || optionsDisabled}
                            variant="primary"
                            className="w-full h-12 uppercase tracking-widest text-[10px] font-bold"
                            isLoading={isBuying}
                        >
                            Check Out Now
                        </Button>
                    </div>
                </div>
            </Transition>

            {/* 规格选择抽屉 (保持不变，但增加一点圆角美感) */}
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
                        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
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
                            <Dialog.Panel className="relative mt-auto flex w-full flex-col bg-white p-6 rounded-t-[2rem] shadow-2xl">
                                <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" /> {/* 顶部装饰条 */}
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-900">Select Options</h2>
                                    <button onClick={close} className="p-2 -mr-2 text-gray-400 text-xs uppercase font-bold">Done</button>
                                </div>

                                <div className="flex flex-col gap-y-8 overflow-y-auto max-h-[60vh] pb-10">
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
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition>
        </>
    )
}

export default MobileActions