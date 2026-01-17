"use client"

import { useState, useEffect } from "react"
import { Globe, X, ChevronRight } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { updateRegion } from "@lib/data/cart"
import { updateLocale } from "@lib/data/locale-actions"

export default function DesktopPreferences({ regions, locales, currentLocale }: any) {
    const [isOpen, setIsOpen] = useState(false)
    const [openSection, setOpenSection] = useState<string | null>(null)
    const pathname = usePathname()
    const router = useRouter()

    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden'
        else document.body.style.overflow = 'unset'
        return () => { document.body.style.overflow = 'unset' }
    }, [isOpen])

    const handleRegionChange = async (countryCode: string) => {
        const pathParts = pathname.split("/")
        if (pathParts.length > 1) pathParts.splice(1, 1)
        const restOfPath = pathParts.join("/") || "/"
        await updateRegion(countryCode, restOfPath)
        setIsOpen(false)
    }

    const handleLocaleChange = async (localeCode: string) => {
        await updateLocale(localeCode)
        setIsOpen(false)
        router.refresh()
    }

    const currentCountryCode = pathname.split("/")[1]
    const currentCountryName = regions?.flatMap((r: any) => r.countries).find((c: any) => c.iso_2 === currentCountryCode)?.display_name || "Select"
    const currentLanguageName = locales?.find((l: any) => l.code === currentLocale)?.name || "English"

    return (
        <>
            {/* 触发图标 */}
            <button
                onClick={() => setIsOpen(true)}
                className="text-gray-700 hover:text-black w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-50 transition-all"
            >
                <Globe size={20} strokeWidth={1.5} />
            </button>

            {/* 背景遮罩 */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-[1000] bg-black/20 backdrop-blur-sm transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* 右侧滑动面板 */}
            <div className={`fixed inset-y-0 right-0 z-[1001] w-[400px] bg-white shadow-2xl transform transition-transform duration-500 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
                <div className="flex flex-col h-full">
                    {/* Panel Header */}
                    <div className="flex justify-between items-center px-8 h-[90px] border-b border-gray-50">
                        <span className="text-[14px] font-bold tracking-[0.2em] uppercase">Settings</span>
                        <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8">
                        <div className="mb-10 text-gray-400 text-[10px] uppercase tracking-[0.3em] font-bold">Preferences</div>

                        {/* 国家选择部分 */}
                        <div className="mb-6">
                            <button
                                onClick={() => setOpenSection(openSection === 'region' ? null : 'region')}
                                className="w-full flex justify-between items-center py-4 border-b border-gray-100 group"
                            >
                                <span className="text-[12px] uppercase tracking-widest font-medium">Shipping to</span>
                                <div className="flex items-center gap-x-3">
                                    <span className="text-[11px] text-gray-400">{currentCountryName}</span>
                                    <ChevronRight size={14} className={`transition-transform ${openSection === 'region' ? 'rotate-90' : ''}`} />
                                </div>
                            </button>
                            <div className={`overflow-hidden transition-all duration-300 ${openSection === 'region' ? "max-h-[400px] opacity-100 pt-4" : "max-h-0 opacity-0"}`}>
                                <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {regions?.flatMap((r: any) => r.countries).sort((a: any, b: any) => a.display_name.localeCompare(b.display_name)).map((c: any) => (
                                        <button
                                            key={c.iso_2}
                                            onClick={() => handleRegionChange(c.iso_2)}
                                            className={`text-left px-4 py-3 text-[11px] uppercase tracking-widest rounded-lg transition-colors ${c.iso_2 === currentCountryCode ? "bg-black text-white" : "hover:bg-gray-50 text-gray-500 hover:text-black"}`}
                                        >
                                            {c.display_name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 语言选择部分 */}
                        <div className="mb-6">
                            <button
                                onClick={() => setOpenSection(openSection === 'lang' ? null : 'lang')}
                                className="w-full flex justify-between items-center py-4 border-b border-gray-100 group"
                            >
                                <span className="text-[12px] uppercase tracking-widest font-medium">Language</span>
                                <div className="flex items-center gap-x-3">
                                    <span className="text-[11px] text-gray-400">{currentLanguageName}</span>
                                    <ChevronRight size={14} className={`transition-transform ${openSection === 'lang' ? 'rotate-90' : ''}`} />
                                </div>
                            </button>
                            <div className={`overflow-hidden transition-all duration-300 ${openSection === 'lang' ? "max-h-[300px] opacity-100 pt-4" : "max-h-0 opacity-0"}`}>
                                <div className="flex flex-col gap-2">
                                    {locales?.map((l: any) => (
                                        <button
                                            key={l.code}
                                            onClick={() => handleLocaleChange(l.code)}
                                            className={`text-left px-4 py-3 text-[11px] uppercase tracking-widest rounded-lg transition-colors ${l.code === currentLocale ? "bg-black text-white" : "hover:bg-gray-50 text-gray-500 hover:text-black"}`}
                                        >
                                            {l.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 border-t border-gray-50 text-center">
                        <p className="text-[10px] text-gray-300 uppercase tracking-[0.4em]">© {new Date().getFullYear()} LILA ZEN</p>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #eee; border-radius: 10px; }
            `}</style>
        </>
    )
}