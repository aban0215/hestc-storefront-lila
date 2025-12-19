import { getStrapiData, getStrapiSingle } from "../strapi"
import { BrandData, MenuItem } from "../../types/strapi"

/**
 * 获取品牌数据
 */
export async function getBrandData(): Promise<BrandData | null> {
    try {
        const data = await getStrapiSingle("lila-header")
        return data as BrandData
    } catch (error) {
        console.error("Failed to fetch brand data:", error)
        return null
    }
}

/**
 * 获取菜单数据并转换为树形结构
 */
export async function getMenuData(): Promise<MenuItem[]> {
    try {
        const data = await getStrapiData("lila-menuitems")

        if (!Array.isArray(data)) {
            console.error("Menu data is not an array:", data)
            return []
        }

        // 转换扁平数据为树形结构
        return buildMenuTree(data as MenuItem[])
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