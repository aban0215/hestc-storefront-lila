"use client"

import { isManual, isStripeLike } from "@lib/constants"
import { placeOrder } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import { useElements, useStripe } from "@stripe/react-stripe-js"
import { PayPalButtons } from "@paypal/react-paypal-js"
import React, { useState } from "react"
import ErrorMessage from "../error-message"

type PaymentButtonProps = {
    cart: HttpTypes.StoreCart
    "data-testid": string
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
                                                         cart,
                                                         "data-testid": dataTestId,
                                                     }) => {
    const notReady =
        !cart ||
        !cart.shipping_address ||
        !cart.billing_address ||
        !cart.email ||
        (cart.shipping_methods?.length ?? 0) < 1

    // 寻找当前待处理的支付会话
    const paymentSession = cart.payment_collection?.payment_sessions?.find(
        (s) => s.status === "pending" || s.status === "requires_action"
    )

    // console.log("Current Payment Session:", paymentSession)

    switch (true) {
        case isStripeLike(paymentSession?.provider_id):
            return (
                <StripePaymentButton
                    notReady={notReady}
                    cart={cart}
                    data-testid={dataTestId}
                />
            )
        // --- PayPal 逻辑分支 ---
        case paymentSession?.provider_id === "pp_paypal_paypal" ||
        paymentSession?.provider_id === "paypal":
            return <PaypalPaymentButton notReady={notReady} cart={cart} />

        case isManual(paymentSession?.provider_id):
            return (
                <ManualTestPaymentButton notReady={notReady} data-testid={dataTestId} />
            )
        default:
            return <Button disabled>Select a payment method</Button>
    }
}

/**
 * PayPal 支付按钮组件 - 完整版修复
 */
const PaypalPaymentButton = ({
                                 cart,
                                 notReady,
                             }: {
    cart: HttpTypes.StoreCart
    notReady: boolean
}) => {
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)

    // 准确定位 PayPal Session
    const session = cart.payment_collection?.payment_sessions?.find(
        (s) => s.provider_id === "pp_paypal_paypal" || s.provider_id === "paypal"
    )

    const onPaymentCompleted = async () => {
        setSubmitting(true)
        try {
            // placeOrder 会调用 Medusa 后端的 /complete 接口
            // 从而触发后端的 authorizePayment
            await placeOrder()
        } catch (err: any) {
            setErrorMessage(err.message || "An error occurred during order placement.")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="w-full relative z-0">
            <PayPalButtons
                style={{ layout: "vertical", shape: "rect", color: "gold" }}
                disabled={notReady || submitting}
                // 这里的 createOrder 返回后端生成的 PayPal Order ID (字符串)
                createOrder={async () => {
                    const id = session?.data?.id as string
                    if (!id) {
                        setErrorMessage("PayPal session ID not found. Please refresh.")
                        return ""
                    }
                    return id
                }}
                // 用户在 PayPal 弹窗点击付款成功后触发
                onApprove={async (data, actions) => {
                    console.log("DEBUG: PayPal 授权成功, data:", data);
                    try {
                        // 强制弹窗，确认代码跑到了这里
                        // alert("PayPal 已授权，正在调取后端完成订单...");

                        await onPaymentCompleted();

                        // alert("恭喜！onPaymentCompleted 执行完毕");
                    } catch (err) {
                        // 这一步是抓鬼的关键！
                        console.error("CRITICAL ERROR in onApprove:", err);
                        alert("下单失败！错误原因: " + err.message);
                    }
                }}
                // 处理 PayPal 弹窗内部错误
                onError={(err) => {
                    setErrorMessage("PayPal window error. Please try again.")
                    console.error("PayPal SDK Error:", err)
                }}
                // 用户中途关闭弹窗
                onCancel={() => {
                    setErrorMessage("Payment cancelled by user.")
                }}
            />
            {submitting && (
                <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
                    <span>Processing Order...</span>
                </div>
            )}
            <ErrorMessage
                error={errorMessage}
                data-testid="paypal-payment-error-message"
            />
        </div>
    )
}

/**
 * Stripe 支付按钮组件 (保持原样)
 */
const StripePaymentButton = ({
                                 cart,
                                 notReady,
                                 "data-testid": dataTestId,
                             }: {
    cart: HttpTypes.StoreCart
    notReady: boolean
    "data-testid"?: string
}) => {
    const [submitting, setSubmitting] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const onPaymentCompleted = async () => {
        setSubmitting(true)
        console.log("DEBUG: 开始调用 placeOrder...");
        try {
            const response = await placeOrder();
            console.log("DEBUG: 下单成功!", response);
            // 如果这里成功了，页面应该会跳转
        } catch (err: any) {
            // 这里是关键！
            console.error("DEBUG: 下单接口报错详情:", err);
            // 强制弹窗，看看到底是不是 401 或者 500
            alert("下单失败，后端返回：" + (err.response?.data?.message || err.message));
            setErrorMessage(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    const stripe = useStripe()
    const elements = useElements()
    const card = elements?.getElement("card")

    const session = cart.payment_collection?.payment_sessions?.find(
        (s) => s.status === "pending"
    )

    const disabled = !stripe || !elements ? true : false

    const handlePayment = async () => {
        setSubmitting(true)

        if (!stripe || !elements || !card || !cart) {
            setSubmitting(false)
            return
        }

        await stripe
            .confirmCardPayment(session?.data.client_secret as string, {
                payment_method: {
                    card: card,
                    billing_details: {
                        name:
                            cart.billing_address?.first_name +
                            " " +
                            cart.billing_address?.last_name,
                        address: {
                            city: cart.billing_address?.city ?? undefined,
                            country: cart.billing_address?.country_code ?? undefined,
                            line1: cart.billing_address?.address_1 ?? undefined,
                            line2: cart.billing_address?.address_2 ?? undefined,
                            postal_code: cart.billing_address?.postal_code ?? undefined,
                            state: cart.billing_address?.province ?? undefined,
                        },
                        email: cart.email,
                        phone: cart.billing_address?.phone ?? undefined,
                    },
                },
            })
            .then(({ error, paymentIntent }) => {
                if (error) {
                    const pi = error.payment_intent

                    if (
                        (pi && pi.status === "requires_capture") ||
                        (pi && pi.status === "succeeded")
                    ) {
                        onPaymentCompleted()
                    }

                    setErrorMessage(error.message || null)
                    return
                }

                if (
                    (paymentIntent && paymentIntent.status === "requires_capture") ||
                    paymentIntent.status === "succeeded"
                ) {
                    return onPaymentCompleted()
                }

                return
            })
    }

    return (
        <>
            <Button
                disabled={disabled || notReady}
                onClick={handlePayment}
                size="large"
                isLoading={submitting}
                data-testid={dataTestId}
            >
                Place order
            </Button>
            <ErrorMessage
                error={errorMessage}
                data-testid="stripe-payment-error-message"
            />
        </>
    )
}

/**
 * 手动测试/货到付款按钮 (保持原样)
 */
const ManualTestPaymentButton = ({ notReady }: { notReady: boolean }) => {
    const [submitting, setSubmitting] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const onPaymentCompleted = async () => {
        await placeOrder()
            .catch((err) => {
                setErrorMessage(err.message)
            })
            .finally(() => {
                setSubmitting(false)
            })
    }

    const handlePayment = () => {
        setSubmitting(true)

        onPaymentCompleted()
    }

    return (
        <>
            <Button
                disabled={notReady}
                isLoading={submitting}
                onClick={handlePayment}
                size="large"
                data-testid="submit-order-button"
            >
                Place order
            </Button>
            <ErrorMessage
                error={errorMessage}
                data-testid="manual-payment-error-message"
            />
        </>
    )
}

export default PaymentButton