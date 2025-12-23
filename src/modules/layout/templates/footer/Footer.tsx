"use client"

import React from "react"
import Link from "next/link"
import { FooterSettingData } from "../../../../lib/strapi/home-data"
import { Truck, ShieldCheck, CreditCard, HelpCircle } from "lucide-react"

const IconMap: Record<string, React.ReactNode> = {
    shipping: <Truck strokeWidth={1.5} size={18} />,
    authentic: <ShieldCheck strokeWidth={1.5} size={18} />,
    secure_payment: <CreditCard strokeWidth={1.5} size={18} />,
    support: <HelpCircle strokeWidth={1.5} size={18} />,
}

interface FooterProps {
    data: FooterSettingData
}

const Footer = ({ data }: FooterProps) => {
    const currentYear = new Date().getFullYear().toString()

    return (
        <footer className="bg-white border-t border-ui-border-base pt-1 pb-6 text-ui-fg-base">
            <div className="container mx-auto px-4">

                {/* 1. Value Props: 极致压缩高度版本 (水平排列) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 border-b border-ui-border-base pb-0">
                    {/*{data.value_props.map((prop) => (*/}
                    {/*    <div key={prop.id} className="flex items-center justify-center md:justify-start gap-x-3 group">*/}
                    {/*        <div className="text-ui-fg-subtle group-hover:text-ui-fg-base transition-colors duration-300">*/}
                    {/*            {IconMap[prop.icon_code] || <HelpCircle size={18} />}*/}
                    {/*        </div>*/}
                    {/*        <div className="flex flex-col">*/}
                    {/*            <h3 className="text-[11px] font-bold tracking-wider uppercase leading-none">*/}
                    {/*                {prop.title}*/}
                    {/*            </h3>*/}
                    {/*            <p className="text-[10px] text-ui-fg-muted font-light leading-tight mt-0.5 whitespace-nowrap">*/}
                    {/*                {prop.description}*/}
                    {/*            </p>*/}
                    {/*        </div>*/}
                    {/*    </div>*/}
                    {/*))}*/}
                </div>

                {/* 2. Main Navigation & Newsletter: 往中间靠拢 */}
                <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 pb-6">
                    {/* 导航列 (占7列) - 内部链接也稍微收紧 */}
                    <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
                        {data.nav_columns.map((column) => (
                            <div key={column.id}>
                                <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] mb-6 text-ui-fg-base">
                                    {column.title}
                                </h4>
                                <ul className="flex flex-col gap-y-3">
                                    {column.links.map((link) => (
                                        <li key={link.id}>
                                            <Link
                                                href={link.url}
                                                target={link.is_external ? "_blank" : "_self"}
                                                className="text-[13px] text-ui-fg-subtle hover:text-ui-fg-base transition-all duration-300 inline-block font-light"
                                            >
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* 订阅区 (占5列) */}
                    <div className="lg:col-span-5 flex flex-col lg:pl-12 border-l border-transparent lg:border-ui-border-base">
                        <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] mb-4">
                            {data.newsletter_title}
                        </h4>
                        <p className="text-[12px] text-ui-fg-subtle font-light mb-6">
                            {data.newsletter_description}
                        </p>
                        <form className="relative">
                            <input
                                type="email"
                                placeholder={data.newsletter_placeholder}
                                className="w-full bg-transparent border-b border-ui-border-strong pb-2 text-[13px] outline-none focus:border-ui-fg-base transition-colors font-light"
                            />
                            <button
                                type="submit"
                                className="absolute right-0 bottom-2 text-[11px] font-bold uppercase tracking-widest hover:text-ui-fg-muted transition-colors"
                            >
                                {data.newsletter_button}
                            </button>
                        </form>
                    </div>
                </div>

                {/* 3. Bottom Bar: 合并为一行 (Legal -> Copyright -> Payments) */}
                <div className="pt-5 border-t border-ui-border-base flex flex-col md:flex-row justify-between items-center gap-6">

                    {/* 左侧：Legal Links */}
                    <div className="flex gap-x-6">
                        {data.legal_links.map((link) => (
                            <Link
                                key={link.id}
                                href={link.url}
                                className="text-[10px] text-ui-fg-muted hover:text-ui-fg-base transition-colors uppercase tracking-[0.1em] whitespace-nowrap"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* 中间：Copyright */}
                    <p className="text-[10px] text-ui-fg-muted/60 tracking-widest uppercase">
                        {data.copyright_text.replace('{year}', currentYear)}
                    </p>

                    {/* 右侧：Payment Icons */}
                    <div className="flex items-center gap-x-4 grayscale opacity-50 hover:opacity-100 transition-all duration-500">
                        {data.payment_icons.map((icon) => (
                            <img
                                key={icon.id}
                                src={icon.url}
                                alt={icon.alternativeText}
                                className="h-3.5 w-auto object-contain"
                            />
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer