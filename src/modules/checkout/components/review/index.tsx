"use client"

import { Heading, Text, clx } from "@medusajs/ui"
import PaymentButton from "../payment-button"
import { useSearchParams } from "next/navigation"
import React from "react"

const Review = ({ cart }: { cart: any }) => {
    const searchParams = useSearchParams()

    // 检查当前结账步骤是否为 review
    const isOpen = searchParams.get("step") === "review"

    // 检查是否已通过礼品卡全额支付
    const paidByGiftcard =
        cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0

    // 检查前面的步骤（地址、配送方式、支付方式）是否已完成
    const previousStepsCompleted =
        !!cart.shipping_address &&
        cart.shipping_methods.length > 0 &&
        (!!cart.payment_collection || paidByGiftcard)

    // --- 新增：判断当前是否选中了 PayPal ---
    const activeSession = cart.payment_collection?.payment_sessions?.find(
        (s: any) => s.status === "pending"
    )

    // 匹配我们在 PaymentButton 中确认过的真实 ID
    const isPaypal =
        activeSession?.provider_id === "pp_paypal_paypal" ||
        activeSession?.provider_id === "paypal"

    return (
        <div className="bg-white">
            <div className="flex flex-row items-center justify-between mb-6">
                <Heading
                    level="h2"
                    className={clx(
                        "flex flex-row text-3xl-regular gap-x-2 items-baseline",
                        {
                            "opacity-50 pointer-events-none select-none": !isOpen,
                        }
                    )}
                >
                    Review
                </Heading>
            </div>
            {isOpen && previousStepsCompleted && (
                <>
                    <div className="flex items-start gap-x-1 w-full mb-6">
                        <div className="w-full">
                            <Text className="txt-medium-plus text-ui-fg-base mb-1">
                                {/* 动态显示的提示语 */}
                                By clicking the {isPaypal ? "PayPal" : "Place Order"} button, you confirm that you have
                                read, understand and accept our Terms of Use, Terms of Sale and
                                Returns Policy and acknowledge that you have read Lila Zen
                                Store&apos;s Privacy Policy.
                            </Text>
                        </div>
                    </div>
                    {/* 这里会根据 provider_id 自动渲染原生按钮或 PayPal 按钮 */}
                    <PaymentButton cart={cart} data-testid="submit-order-button" />
                </>
            )}
        </div>
    )
}

export default Review