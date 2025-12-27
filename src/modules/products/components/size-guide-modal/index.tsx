"use client"

import React, { useState, useEffect } from "react"
import { X } from "lucide-react"
import { StrapiImage } from "../../../../lib/strapi/product-content" // 确保路径正确

export default function SizeGuideModal({ sizeGuide }: { sizeGuide: StrapiImage }) {
    const [isOpen, setIsOpen] = useState(false)

    // 优化：当弹窗打开时，禁止背后页面滚动
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => { document.body.style.overflow = 'unset' }
    }, [isOpen])

    // 优化：按下 ESC 键关闭
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false)
        }
        window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [])

    return (
        <>
            {/* 1. 触发按钮：设计为极简风格 */}
            <button
                type="button"
                onClick={(e) => {
                    e.preventDefault()
                    setIsOpen(true)
                }}
                className="text-[10px] tracking-[0.2em] uppercase font-bold text-gray-400 hover:text-pink-600 transition-colors underline underline-offset-4"
            >
                Size Guide
            </button>

            {/* 2. 弹窗主体 - 确保 z-index 足够高 ([z-1000] 改为 [z-[9999]]) */}
            {isOpen && (
                <div
                    className="fixed inset-0 flex items-center justify-center p-4 md:p-8 z-[9999] animate-in fade-in duration-200"
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
                >
                    {/* 半透明遮罩层 - 点击此处可关闭 */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* 内容容器 */}
                    <div className="relative bg-white rounded-2xl w-full max-w-4xl max-h-full overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">

                        {/* Header: 包含标题和关闭按钮 */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900">Size Guide</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                                aria-label="Close modal"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* 图片主体 - 增加内部滚动防止大图溢出 */}
                        <div className="p-6 overflow-y-auto flex justify-center bg-gray-50">
                            <img
                                src={sizeGuide.url}
                                alt="Size Guide Content"
                                className="w-full h-auto object-contain rounded-lg"
                            />
                        </div>

                        {/* Footer: 辅助提示 */}
                        <div className="px-6 py-4 bg-white border-t border-gray-50 text-center">
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                                All measurements are in cm unless otherwise stated.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}