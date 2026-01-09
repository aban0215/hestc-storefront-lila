"use client"

import { Fragment } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { XMark } from "@medusajs/icons"
import { Text } from "@medusajs/ui"

type FilterDrawerProps = {
    isOpen: boolean
    close: () => void
    children: React.ReactNode
}

const FilterDrawer = ({ isOpen, close, children }: FilterDrawerProps) => {
    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[100]" onClose={close}>
                {/* 1. 背景遮罩 - 采用高亮毛玻璃感 */}
                <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-500"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-500"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-900/10 backdrop-blur-sm transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full">
                            <Transition.Child
                                as={Fragment}
                                enter="transform transition ease-in-out duration-500"
                                enterFrom="translate-x-full"
                                enterTo="translate-x-0"
                                leave="transform transition ease-in-out duration-500"
                                leaveFrom="translate-x-0"
                                leaveTo="translate-x-full"
                            >
                                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                                    <div className="flex h-full flex-col bg-white shadow-xl">
                                        {/* 2. 抽屉头部 */}
                                        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
                                            <Text className="text-[14px] uppercase tracking-[0.3em] font-light text-gray-900">
                                                Filters
                                            </Text>
                                            <button
                                                type="button"
                                                className="text-gray-400 hover:text-black transition-colors"
                                                onClick={close}
                                            >
                                                <XMark />
                                            </button>
                                        </div>

                                        {/* 3. 抽屉内容区 - 留给后续的 FilterMenu */}
                                        <div className="relative flex-1 overflow-y-auto px-8 py-8">
                                            {children}
                                        </div>

                                        {/* 4. 底部操作栏 */}
                                        <div className="border-t border-gray-100 px-8 py-6 flex gap-x-4">
                                            <button
                                                className="flex-1 text-[10px] uppercase tracking-[0.2em] py-4 border border-gray-200 hover:border-black transition-all"
                                                onClick={() => {/* 逻辑后续补 */}}
                                            >
                                                Clear All
                                            </button>
                                            <button
                                                className="flex-1 text-[10px] uppercase tracking-[0.2em] py-4 bg-black text-white hover:bg-gray-800 transition-all"
                                                onClick={close}
                                            >
                                                Apply
                                            </button>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    )
}

export default FilterDrawer