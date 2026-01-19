import { Metadata } from "next"
import { listCartOptions, retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { getBaseURL } from "@lib/util/env"
import { StoreCartShippingOption } from "@medusajs/types"
import CartMismatchBanner from "@modules/layout/components/cart-mismatch-banner"
import Footer from "@modules/layout/templates/footer"
import Nav from "@modules/layout/templates/nav"
import FreeShippingPriceNudge from "@modules/shipping/components/free-shipping-price-nudge"

// --- 1. 引入刚才创建的组件 ---
import CookieBanner from "@modules/layout/components/cookie-banner"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function PageLayout(props: { children: React.ReactNode }) {
  const customer = await retrieveCustomer()
  const cart = await retrieveCart()
  let shippingOptions: StoreCartShippingOption[] = []

  if (cart) {
    const { shipping_options } = await listCartOptions()
    shippingOptions = shipping_options
  }

    return (
        <div className="relative flex flex-col min-h-screen">
            {/* 1. Nav 必须在最顶层 */}
            <Nav />

            {/* 2. Banner 们应该紧随其后，但不能干扰 Nav */}
            <div className="relative z-[90]">
                {customer && cart && (
                    <CartMismatchBanner customer={customer} cart={cart} />
                )}
                {cart && (
                    <FreeShippingPriceNudge
                        variant="popup"
                        cart={cart}
                        shippingOptions={shippingOptions}
                    />
                )}
            </div>

            {/* 3. 页面主体内容 */}
            <main className="relative flex-1">
                {props.children}
            </main>

            <Footer />
            <CookieBanner />
        </div>
    )
}