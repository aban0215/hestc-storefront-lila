"use client" // 只有这个小组件是客户端的

import { useState } from "react"
import FilterDrawer from "../../../../app/components/filter-drawer";

type FilterWrapperProps = {
    // 这里以后可以传 collections, tags 等数据进去
    children?: React.ReactNode
}

export default function FilterWrapper({ children }: FilterWrapperProps) {
    const [isFilterOpen, setIsFilterOpen] = useState(false)

    return (
        <>
            <button
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center gap-x-2 text-[10px] font-medium tracking-[0.15em] text-gray-900 uppercase group"
            >
          <span className="pb-0.5 border-b border-transparent group-hover:border-black transition-all">
              Filter
          </span>
            </button>

            <FilterDrawer
                isOpen={isFilterOpen}
                close={() => setIsFilterOpen(false)}
            >
                {children}
            </FilterDrawer>
        </>
    )
}