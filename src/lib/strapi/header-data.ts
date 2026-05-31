import { BrandData, MenuItem } from "../../types/strapi"

const STRAPI_BASE_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL

/**
 * 获取品牌数据（含 logo）
 */
export async function getBrandData(locale: string = 'en-US'): Promise<BrandData | null> {
    try {
        const res = await fetch(
            `${STRAPI_BASE_URL}/api/lila-header?locale=${locale}&populate=*`,
            { next: { revalidate: 3600 } }
        )
        const json = await res.json()
        return json.data as BrandData
    } catch (error) {
        console.error("Failed to fetch brand data:", error)
        return null
    }
}

/**
 * 获取菜单数据并转换为树形结构（分页拉取所有条目）
 */
export async function getMenuData(locale: string = 'en-US'): Promise<MenuItem[]> {
    try {
        const allItems: any[] = []
        let page = 1
        while (true) {
            const res = await fetch(
                `${STRAPI_BASE_URL}/api/lila-menuitems?locale=${locale}&populate=*&sort=order:asc&pagination[page]=${page}&pagination[pageSize]=100`,
                { next: { revalidate: 3600 } }
            )
            const data = await res.json()
            const items = data.data || []
            allItems.push(...items)
            const total = data.meta?.pagination?.total ?? 0
            if (allItems.length >= total || items.length === 0) break
            page++
        }
        return buildMenuTree(allItems)
    } catch (error) {
        console.error("Failed to fetch menu data:", error)
        return []
    }
}

/**
 * 将扁平菜单数据转换为树形结构
 */
function buildMenuTree(items: MenuItem[]): MenuItem[] {
    // 1. 过滤 visible: true 的项
    const visibleItems = items.filter(item => item.visible === true)

    // 2. 找出顶级菜单项 (parent === null)
    const topLevelItems = visibleItems.filter(item => !item.parent)

    // 3. 按 order 排序
    topLevelItems.sort((a, b) => a.order - b.order)

    // 4. 递归添加子菜单
    const buildTree = (parentId: number | null): MenuItem[] => {
        const children = visibleItems
            .filter(item => {
                if (parentId === null) {
                    return item.parent?.id === null
                }
                return item.parent?.id === parentId
            })
            .sort((a, b) => a.order - b.order)
            .map(child => ({
                ...child,
                children: buildTree(child.id)
            }))

        return children
    }

    // 为顶级菜单项添加子菜单
    return topLevelItems.map(item => ({
        ...item,
        children: buildTree(item.id)
    }))
}