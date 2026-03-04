// src/modules/checkout/templates/checkout-form/index.tsx

import { listCartShippingMethods } from "@lib/data/fulfillment"
import { listCartPaymentMethods } from "@lib/data/payment"
import { HttpTypes } from "@medusajs/types"
import Addresses from "@modules/checkout/components/addresses"
import Payment from "@modules/checkout/components/payment"
import Review from "@modules/checkout/components/review"
import Shipping from "@modules/checkout/components/shipping"

export default async function CheckoutForm({
                                               cart,
                                               customer,
                                           }: {
    cart: HttpTypes.StoreCart | null
    customer: HttpTypes.StoreCustomer | null
}) {
    if (!cart) return null

    const shippingMethods = await listCartShippingMethods(cart.id)
    const paymentMethods = await listCartPaymentMethods(cart.region?.id ?? "")

    if (!shippingMethods || !paymentMethods) return null

    return (
        <div className="w-full grid grid-cols-1 gap-y-10">

            {/* --- 支付增强栏：字体微调放大版 --- */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row items-center justify-between gap-y-6">
                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <span className="text-[13px] uppercase tracking-[0.2em] text-gray-900 font-bold mb-2">
              Secure Payment Methods
            </span>
                        <p className="text-sm md:text-base text-gray-500 font-medium">
                            Pay via PayPal or Credit/Debit Card securely.
                        </p>
                    </div>

                    {/* 图标组 */}
                    <div className="flex items-center gap-x-5">
                        {/* PayPal 图标 */}
                        <div className="h-8 border-r pr-5 border-gray-200 flex items-center">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-6" />
                        </div>
                        {/* 信用卡图标组 - 尺寸微增 */}
                        <div className="flex items-center gap-x-3">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-7 opacity-90" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg" alt="Amex" className="h-7 opacity-90" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b7/MasterCard_Logo.svg" alt="Discover" className="h-5 opacity-90 hidden md:block" />
                        </div>
                    </div>
                </div>

                {/* 温馨提示 - 字体放大并加深颜色 */}
                <div className="mt-5 pt-4 border-t border-gray-50 flex items-center justify-center gap-x-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs md:text-sm text-gray-600 font-medium">
            No PayPal account? You can still pay with your <span className="text-gray-900 underline underline-offset-4">credit card</span> on the next step.
          </span>
                </div>
            </div>
            {/* --------------------------- */}

            <Addresses cart={cart} customer={customer} />
            <Shipping cart={cart} availableShippingMethods={shippingMethods} />
            <Payment cart={cart} availablePaymentMethods={paymentMethods} />
            <Review cart={cart} />
        </div>
    )
}