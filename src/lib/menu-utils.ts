/**
 * 菜单链接生成工具 — 共享实现，NavLinks 和 MobileMenu 均从此导入
 */
export function getMenuHref(
    linkType: string,
    slug: string,
    medusaHandle?: string
) {
    const cleanSlug = (slug || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/^\//, "")

    switch (linkType) {
        case "category": {
            const handle = (medusaHandle || "")
                .trim()
                .toLowerCase()
                .replace(/^\//, "")
            return `/categories/${encodeURIComponent(handle)}`
        }
        case "collection": {
            const handle = (medusaHandle || "")
                .trim()
                .toLowerCase()
                .replace(/^\//, "")
            if (!handle) return "/store"
            return `/collections/${encodeURIComponent(handle)}`
        }
        case "blog":
            return `/blog`
        case "page":
            return `/pages/${encodeURIComponent(cleanSlug)}`
        default:
            return `/${encodeURIComponent(cleanSlug)}`
    }
}
