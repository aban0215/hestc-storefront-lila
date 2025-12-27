import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getFooterBottomSettings } from "../../../../lib/strapi/home-data"

export default async function Footer({ data }: { data: any }) {
    if (!data) return null

    const { footer } = data
    const footerBottomData = await getFooterBottomSettings()

    return (
        <footer className="bg-white text-gray-900 pt-10 pb-6 border-t border-gray-100">
            <div className="content-container mx-auto px-4 sm:px-6 lg:px-8">

                {/* 顶部：模块化矩阵 - 极致紧凑 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-2 gap-y-8 mb-10 max-w-5xl">
                    {footer?.map((column: any) => (
                        <div key={column.id} className="flex flex-col">
                            <h3 className="text-[12px] font-bold tracking-[0.05em] uppercase text-gray-800 mb-2">
                                {column.category_name}
                            </h3>

                            <ul className="flex flex-col gap-y-1.5">
                                {column.lilalinks?.map((link: any) => {
                                    const linkClass = "text-[13px] text-gray-500 hover:text-gray-900 transition-colors duration-200"

                                    if (link.external_url) {
                                        return (
                                            <li key={link.id}>
                                                <a href={link.external_url} target="_blank" rel="noopener noreferrer" className={linkClass}>
                                                    {link.label}
                                                </a>
                                            </li>
                                        )
                                    }

                                    if (link.page?.slug) {
                                        return (
                                            <li key={link.id}>
                                                <LocalizedClientLink href={`/pages/${link.page.slug}`} className={linkClass}>
                                                    {link.label}
                                                </LocalizedClientLink>
                                            </li>
                                        )
                                    }

                                    return (
                                        <li key={link.id} className="text-[13px] text-gray-400">
                                            {link.label}
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* 底部区域：全宽分割线 */}
            {footerBottomData && (
                <div className="border-t border-gray-200">
                    <div className="content-container mx-auto px-4 sm:px-6 lg:px-8">
                        {/* 桌面端：大文字、原图色图标 */}
                        <div className="hidden md:flex flex-row items-center justify-between py-6">
                            {/* 左侧：版权 */}
                            <div className="flex-1 flex items-center">
                                <div
                                    className="text-base text-gray-600 font-medium"
                                    dangerouslySetInnerHTML={{ __html: footerBottomData.copyrightText }}
                                />
                            </div>

                            {/* 中间：支付图标 (原色) */}
                            <div className="flex-1 flex justify-center items-center">
                                <div className="flex items-center gap-5">
                                    {footerBottomData.paymentIcons?.map((icon: any) => (
                                        <img
                                            key={icon.id}
                                            src={icon.url}
                                            alt="payment"
                                            className="h-7 w-auto object-contain"
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* 右侧：社交媒体 */}
                            <div className="flex-1 flex justify-end items-center">
                                <div className="flex items-center gap-6">
                                    {footerBottomData.socialMediaLinks?.map((social: any) => (
                                        <a key={social.id} href={social.url} className="hover:scale-110 transition-transform">
                                            <img
                                                src={social.medialogo?.[0]?.url || `https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/${social.platform}.svg`}
                                                alt={social.platform}
                                                className="h-7 w-7 object-contain"
                                            />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 移动端 */}
                        <div className="md:hidden flex flex-col items-center gap-6 py-8">
                            <div className="flex items-center gap-6">
                                {footerBottomData.socialMediaLinks?.map((social: any) => (
                                    <a key={social.id} href={social.url} className="block">
                                        <img src={social.medialogo?.[0]?.url} alt="" className="h-8 w-8" />
                                    </a>
                                ))}
                            </div>
                            <div className="flex flex-wrap justify-center gap-4">
                                {footerBottomData.paymentIcons?.map((icon: any) => (
                                    <img key={icon.id} src={icon.url} className="h-7 w-auto" alt="" />
                                ))}
                            </div>
                            <div
                                className="text-sm text-gray-500 text-center"
                                dangerouslySetInnerHTML={{ __html: footerBottomData.copyrightText }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </footer>
    )
}