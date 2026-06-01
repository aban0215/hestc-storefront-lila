import { Suspense } from "react"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "./paginated-products"
import BackButton from "@modules/account/components/back-button"

const StoreTemplate = ({
                         sortBy,
                         page,
                         countryCode,
                         searchParams, // --- 1. 新增：接收从 page.tsx 传来的原始参数 ---
                       }: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
  searchParams?: any // --- 2. 新增：类型声明 ---
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  return (
      <div className="w-full bg-white" data-testid="category-container">
        {/* 1. 吸顶工具栏 */}
        <div className="sticky top-12 lg:top-14 z-[50] bg-white border-b border-gray-100">
          <div className="w-full px-4 md:px-8 py-4">
            <div className="flex items-center justify-between w-full">

              {/* 左侧：返回键 */}
              <div className="flex items-center">
                <BackButton className="text-black !tracking-[0.1em]" />
              </div>

              {/* 右侧：Filter + Sort By */}
              <div className="flex items-center gap-x-8 md:gap-x-12">

                {/* Filter 按钮 */}
                {/*<div className="relative group">*/}
                {/*  <button className="flex items-center gap-x-2 text-[10px] font-medium tracking-[0.15em] text-gray-900 uppercase">*/}
                {/*  <span className="pb-0.5 border-b border-transparent group-hover:border-black transition-all">*/}
                {/*    Filter*/}
                {/*  </span>*/}
                {/*    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">*/}
                {/*      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />*/}
                {/*    </svg>*/}
                {/*  </button>*/}

                {/*  /!* 过滤下拉菜单 *!/*/}
                {/*  /!*<div className="absolute top-full right-0 mt-0 py-8 w-[280px] sm:w-[320px] bg-white shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[100] border border-gray-100">*!/*/}
                {/*  /!*  <div className="px-8 max-h-[60vh] overflow-y-auto no-scrollbar">*!/*/}
                {/*  /!*    /!* 这里放入你的 DynamicFilters 组件，确保它能改变 URL *!/*!/*/}
                {/*  /!*    <p className="text-[10px] text-gray-400 uppercase tracking-widest">Select Filters</p>*!/*/}
                {/*  /!*  </div>*!/*/}
                {/*  /!*</div>*!/*/}
                {/*</div>*/}

                {/* Sort By 按钮 */}
                <div className="relative group">
                  <button className="flex items-center gap-x-2 text-[10px] font-medium tracking-[0.15em] text-gray-900 uppercase">
                  <span className="pb-0.5 border-b border-transparent group-hover:border-black transition-all">
                    Sort By
                  </span>
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <div className="absolute top-full right-0 mt-0 py-5 w-48 bg-white shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[100] border border-gray-100">
                    <div className="px-6">
                      <RefinementList sortBy={sort} />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* 2. 商品列表区域 */}
        <div className="w-full mt-10">
          <div className="px-4 md:px-8 pb-24">
            {/* 这里为 Suspense 加上 key，可以让过滤时显示加载状态，体验更好 */}
            <Suspense
                key={JSON.stringify(searchParams)}
                fallback={<SkeletonProductGrid numberOfProducts={8} />}
            >
              <PaginatedProducts
                  sortBy={sort}
                  page={pageNumber}
                  countryCode={countryCode}
                  searchParams={searchParams} // --- 3. 关键：透传给列表组件进行 API 过滤 ---
              />
            </Suspense>
          </div>
        </div>
      </div>
  )
}

export default StoreTemplate