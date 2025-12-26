import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function Footer({ data }: { data: any }) {
    if (!data) return null

    // 解构数据
    const { footer } = data

    return (
        <footer className="bg-white text-gray-900 pt-16 pb-12 border-t border-gray-200">
            <div className="content-container mx-auto px-4 sm:px-6 lg:px-8">
                {/* 顶部：模块化矩阵 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {footer?.map((column: any) => (
                        <div key={column.id} className="flex flex-col">
                            {/* 模块标题 */}
                            <h3 className="text-[13px] font-semibold tracking-[0.2em] uppercase text-gray-700 mb-6">
                                {column.category_name}
                            </h3>

                            <ul className="flex flex-col gap-y-3">
                                {column.lilalinks?.map((link: any) => {
                                    const isExternal = !!link.external_url
                                    const internalSlug = link.page?.slug
                                    // 1. 如果是外链
                                    if (isExternal) {
                                        return (
                                            <li key={link.id}>
                                                <a
                                                    href={link.external_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-gray-600 hover:text-gray-900 hover:underline transition-colors duration-200"
                                                >
                                                    {link.label}
                                                </a>
                                            </li>
                                        )
                                    }
                                    // 2. 如果是内部页面链接
                                    if (internalSlug) {
                                        return (
                                            <li key={link.id}>
                                                <LocalizedClientLink
                                                    href={`/pages/${internalSlug}`}
                                                    className="text-sm text-gray-600 hover:text-gray-900 hover:underline transition-colors duration-200"
                                                >
                                                    {link.label}
                                                </LocalizedClientLink>
                                            </li>
                                        )
                                    }
                                    // 3. 既无外链也无内部页面 (静态展示)
                                    return (
                                        <li key={link.id} className="text-sm text-gray-500">
                                            {link.label}
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>
                    ))}
                </div>

            </div>
        </footer>
    )
}