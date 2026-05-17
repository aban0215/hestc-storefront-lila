import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getFooterBottomSettings } from "../../../../lib/strapi/home-data"

export default async function Footer({ data }: { data: any }) {
    if (!data) return null

    const columns = data.nav_columns || []
    const valueProps = data.value_props || []
    const footerBottomData = await getFooterBottomSettings()

    return (
        <footer className="bg-white text-gray-900 border-t border-gray-200">
            <div className="content-container mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">

                {/* 上排：导航列 + Newsletter 并排 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
                    {columns.map((column: any) => (
                        <div key={column.id}>
                            <h4 className="text-[11px] font-semibold tracking-[0.1em] uppercase text-gray-400 mb-4">
                                {column.title}
                            </h4>
                            <ul className="space-y-2">
                                {column.links?.map((link: any) => {
                                    const linkClass = "text-[13px] text-gray-600 hover:text-gray-900 transition-colors"
                                    if (link.is_external && link.url) {
                                        return (
                                            <li key={link.id}>
                                                <a href={link.url} target="_blank" rel="noopener noreferrer" className={linkClass}>{link.label}</a>
                                            </li>
                                        )
                                    }
                                    if (link.url?.startsWith("/pages/")) {
                                        return (
                                            <li key={link.id}>
                                                <LocalizedClientLink href={`/pages/${link.url.replace("/pages/", "")}`} className={linkClass}>{link.label}</LocalizedClientLink>
                                            </li>
                                        )
                                    }
                                    if (link.url) {
                                        return (
                                            <li key={link.id}>
                                                <LocalizedClientLink href={link.url} className={linkClass}>{link.label}</LocalizedClientLink>
                                            </li>
                                        )
                                    }
                                    return <li key={link.id} className="text-[13px] text-gray-400">{link.label}</li>
                                })}
                            </ul>
                        </div>
                    ))}

                    {/* Newsletter 占据最后一列 */}
                    {data.newsletter_title && (
                        <div>
                            <h4 className="text-[11px] font-semibold tracking-[0.1em] uppercase text-gray-400 mb-4">
                                {data.newsletter_title}
                            </h4>
                            {data.newsletter_description && (
                                <p className="text-[13px] text-gray-500 mb-3 leading-relaxed">{data.newsletter_description}</p>
                            )}
                            <form className="flex flex-col gap-2" action="#" method="POST">
                                <input
                                    type="email"
                                    placeholder={data.newsletter_placeholder || "Email"}
                                    className="w-full px-3 py-2 text-[13px] border border-gray-300 focus:outline-none focus:border-gray-600 transition-colors"
                                    required
                                />
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-[11px] font-semibold bg-gray-900 text-white hover:bg-gray-700 transition-colors uppercase tracking-wider"
                                >
                                    {data.newsletter_button || "Subscribe"}
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                {/* Value Props — 去 icon，纯文字 */}
                {valueProps.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 pb-8 border-b border-gray-200">
                        {valueProps.map((vp: any) => (
                            <span key={vp.id} className="text-[11px] text-gray-500 tracking-wide">
                                {vp.title}
                            </span>
                        ))}
                    </div>
                )}

                {/* 底栏：版权 | 支付 | 社交 */}
                {footerBottomData && (
                    <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-[11px] text-gray-400 order-2 md:order-1">
                            {footerBottomData.copyrightText?.replace(/<[^>]*>/g, "")}
                        </p>

                        {footerBottomData.paymentIcons?.length > 0 && (
                            <div className="flex items-center gap-4 order-1 md:order-2">
                                {footerBottomData.paymentIcons.map((icon: any) => (
                                    <img key={icon.id} src={icon.url} alt="" className="h-5 w-auto object-contain opacity-50 hover:opacity-100 transition-opacity" />
                                ))}
                            </div>
                        )}

                        {footerBottomData.socialMediaLinks?.length > 0 && (
                            <div className="flex items-center gap-5 order-3">
                                {footerBottomData.socialMediaLinks.map((social: any) => {
                                    const iconUrl = social.medialogo?.[0]?.url || `https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/${social.platform}.svg`
                                    return (
                                        <a key={social.id} href={social.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900 transition-colors">
                                            <img src={iconUrl} alt={social.platform} className="h-4 w-4 object-contain" />
                                        </a>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </footer>
    )
}
