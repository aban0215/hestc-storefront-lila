"use client"

import dynamic from "next/dynamic"

// 在这里安全地使用 ssr: false
const DynamicMobileMenu = dynamic(() => import("./mobile-menu"), {
    ssr: false,
    loading: () => <div className="p-2 w-10 h-10" />
})

export default function MobileMenuWrapper({ menuTree, brandData, regions, locales, currentLocale }: {
    menuTree: any[]; brandData: any; regions: any; locales: any; currentLocale: string;
}) {
    return <DynamicMobileMenu menuTree={menuTree} brandData={brandData} regions={regions} locales={locales} currentLocale={currentLocale} />
}