"use client"

import { loadStripe } from "@stripe/stripe-js"
import React from "react"
import StripeWrapper from "./stripe-wrapper"
import { HttpTypes } from "@medusajs/types"
import { isStripeLike } from "@lib/constants"
import { PayPalScriptProvider } from "@paypal/react-paypal-js"

type PaymentWrapperProps = {
  cart: HttpTypes.StoreCart
  children: React.ReactNode
}

const stripeKey =
    process.env.NEXT_PUBLIC_STRIPE_KEY ||
    process.env.NEXT_PUBLIC_MEDUSA_PAYMENTS_PUBLISHABLE_KEY

const medusaAccountId = process.env.NEXT_PUBLIC_MEDUSA_PAYMENTS_ACCOUNT_ID
const stripePromise = stripeKey
    ? loadStripe(
        stripeKey,
        medusaAccountId ? { stripeAccount: medusaAccountId } : undefined
    )
    : null

const PaymentWrapper: React.FC<PaymentWrapperProps> = ({ cart, children }) => {
  const paymentSession = cart.payment_collection?.payment_sessions?.find(
      (s) => s.status === "pending"
  )

  // 渲染 Stripe 逻辑或默认子组件
  const renderContent = () => {
    if (
        isStripeLike(paymentSession?.provider_id) &&
        paymentSession &&
        stripePromise
    ) {
      return (
          <StripeWrapper
              paymentSession={paymentSession}
              stripeKey={stripeKey}
              stripePromise={stripePromise}
          >
            {children}
          </StripeWrapper>
      )
    }
    return <>{children}</>
  }

  // 统一包裹 PayPal 环境，即使当前没选 PayPal 也可以静默加载 SDK
  return (
      <PayPalScriptProvider
          options={{
            "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test",
            currency: cart?.currency_code?.toUpperCase(),
            intent: "capture",
          }}
      >
        {renderContent()}
      </PayPalScriptProvider>
  )
}

export default PaymentWrapper