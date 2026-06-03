import { Metadata } from "next"
import { getBaseURL } from "@lib/util/env"
import Footer from "@modules/layout/templates/footer"
import Nav from "@modules/layout/templates/nav"
import CookieBanner from "@modules/layout/components/cookie-banner"
import CartUserOverlay from "@modules/layout/components/cart-user-overlay"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

/**
 * 注意：此 Layout 刻意不调用 cookies() / retrieveCustomer() / retrieveCart()，
 * 否则 Next.js 会将整条路由标为 dynamic，禁用 ISR（revalidate 失效）。
 *
 * Cart/User 状态改为客户端组件 <CartUserOverlay> 在浏览器侧按需拉取。
 */
export default async function PageLayout(props: {
  children: React.ReactNode
  params: Promise<{ countryCode: string }>
}) {
    const { countryCode } = await props.params

    return (
        <div className="relative flex flex-col min-h-screen">
            <Nav countryCode={countryCode} />

            <div className="relative z-[90]">
                <CartUserOverlay />
            </div>

            <main className="relative flex-1">
                {props.children}
            </main>

            <Footer />
            <CookieBanner />
        </div>
    )
}