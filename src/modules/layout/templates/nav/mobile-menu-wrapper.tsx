"use client"

import dynamic from "next/dynamic"

// 在这里安全地使用 ssr: false
const DynamicMobileMenu = dynamic(() => import("./mobile-menu"), {
    ssr: false,
    loading: () => <div className="p-2 w-10 h-10" />
})

export default function MobileMenuWrapper({ menuTree, brandData }: { menuTree: any[], brandData: any }) {
    return <DynamicMobileMenu menuTree={menuTree} brandData={brandData} />
}