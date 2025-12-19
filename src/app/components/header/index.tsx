// src/app/components/header/index.tsx
import { getBaseURL } from "@lib/util/env"

export default function Header() {
    return (
        <header className="sticky top-0 z-50 bg-white border-b">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo和品牌名称 */}
                <div className="flex items-center space-x-3">
                    <div className="text-xl font-bold text-gray-900">
                        LILA ZEN {/* 先写死，下一步从Strapi获取 */}
                    </div>
                </div>

                {/* 右侧占位，保持原有Medusa功能 */}
                <div className="flex items-center space-x-4">
                    <div className="text-gray-600">购物车</div>
                    <div className="text-gray-600">账户</div>
                </div>
            </div>
        </header>
    )
}