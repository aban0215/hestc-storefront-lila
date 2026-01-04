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

  const paymentSession = cart.payment_collection?.payment_sessions?.find(
      (s) => s.status === "pending"
  )

    console.log("Current Payment Session:", paymentSession)
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
    case paymentSession?.provider_id === "pp_paypal_paypal" || paymentSession?.provider_id === "paypal":
      return (
          <PaypalPaymentButton
              notReady={notReady}
              cart={cart}
          />
      )
    case isManual(paymentSession?.provider_id):
      return (
          <ManualTestPaymentButton notReady={notReady} data-testid={dataTestId} />
      )
    default:
        return <Button disabled>Select a payment method</Button>
  }
}

/**
 * PayPal 支付按钮组件
 */
const PaypalPaymentButton = ({
                               cart,
                               notReady
                             }: {
  cart: HttpTypes.StoreCart
  notReady: boolean
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const session = cart.payment_collection?.payment_sessions?.find(
      (s) => s.provider_id === "pp_paypal_paypal" || s.provider_id === "paypal"
  )

  const onPaymentCompleted = async () => {
    await placeOrder().catch((err) => {
      setErrorMessage(err.message)
    })
  }

  return (
      <div className="w-full">
        <PayPalButtons
            style={{ layout: "vertical", shape: "rect", color: "gold" }}
            disabled={notReady}
            // 调用后端 service.ts 中 initiatePayment 生成的订单 ID
            createOrder={async () => {
              const id = session?.data?.id as string
              if (!id) {
                setErrorMessage("PayPal session ID not found")
                return ""
              }
              return id
            }}
            // 用户在 PayPal 弹窗完成操作后
            onApprove={async () => {
              await onPaymentCompleted()
            }}
            onError={(err) => {
              setErrorMessage("An error occurred with PayPal")
              console.error(err)
            }}
        />
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
    await placeOrder()
        .catch((err) => {
          setErrorMessage(err.message)
        })
        .finally(() => {
          setSubmitting(false)
        })
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