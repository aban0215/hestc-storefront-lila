"use client"

import { convertToLocale } from "@lib/util/money"
import { CheckCircleSolid, XMark } from "@medusajs/icons"
import {
  HttpTypes,
  StoreCart,
  StoreCartShippingOption,
  StorePrice,
} from "@medusajs/types"
import { Button, clx } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useState, useEffect } from "react"
import { StoreFreeShippingPrice } from "types/global"

/**
 * 核心逻辑保持不变，确保计算精准
 */
const computeTarget = (
    cart: HttpTypes.StoreCart,
    price: HttpTypes.StorePrice
) => {
  const priceRule = (price.price_rules || []).find(
      (pr) => pr.attribute === "item_total"
  )!

  const currentAmount = cart.item_total
  const targetAmount = parseFloat(priceRule.value)

  const reached = currentAmount >= targetAmount
  const remaining = reached ? 0 : targetAmount - currentAmount
  const percentage = Math.min((currentAmount / targetAmount) * 100, 100)

  return {
    current_amount: currentAmount,
    target_amount: targetAmount,
    target_reached: reached,
    target_remaining: remaining,
    remaining_percentage: percentage,
  }
}

export default function ShippingPriceNudge({
                                             variant = "inline",
                                             cart,
                                             shippingOptions,
                                           }: {
  variant?: "popup" | "inline"
  cart: StoreCart
  shippingOptions: StoreCartShippingOption[]
}) {
  if (!cart || !shippingOptions?.length) return null

  const freeShippingPrice = shippingOptions
      .map((option) => {
        const validPrices = option.prices.filter(
            (p) =>
                p.currency_code === cart.currency_code &&
                (p.price_rules || []).some((pr) => pr.attribute === "item_total")
        )
        return validPrices.map((p) => ({
          ...p,
          shipping_option_id: option.id,
          ...computeTarget(cart, p),
        }))
      })
      .flat(1)
      .find((p) => p?.amount === 0)

  if (!freeShippingPrice) return null

  return variant === "popup" ? (
      <FreeShippingPopup cart={cart} price={freeShippingPrice} />
  ) : (
      <FreeShippingInline cart={cart} price={freeShippingPrice} />
  )
}

/**
 * 1. 内联模式：适合放在购物车侧边栏顶部
 */
function FreeShippingInline({ cart, price }: any) {
  return (
      <div className="w-full bg-gray-50/50 p-4 border border-gray-100 rounded-sm">
        <div className="flex flex-col gap-y-3">
          <div className="flex justify-between items-end">
          <span className="text-[10px] uppercase tracking-[0.15em] font-medium text-gray-900">
            {price.target_reached ? (
                <span className="flex items-center gap-1.5 text-black">
                <CheckCircleSolid className="w-3.5 h-3.5" /> FREE SHIPPING UNLOCKED
              </span>
            ) : (
                "Shipping Information"
            )}
          </span>
            {!price.target_reached && (
                <span className="text-[10px] text-gray-400 tracking-tight">
              Add <span className="text-black font-semibold">
                {convertToLocale({ amount: price.target_remaining, currency_code: cart.currency_code })}
              </span> for free shipping
            </span>
            )}
          </div>

          {/* 进度条轨道 */}
          <div className="relative w-full h-[2px] bg-gray-200 overflow-hidden">
            <div
                className={clx(
                    "absolute left-0 top-0 h-full transition-all duration-1000 ease-out",
                    price.target_reached ? "bg-black" : "bg-gray-900"
                )}
                style={{ width: `${price.remaining_percentage}%` }}
            />
          </div>
        </div>
      </div>
  )
}

/**
 * 2. 弹窗模式：手机端底部横条，桌面端右下角
 */
function FreeShippingPopup({ cart, price }: any) {
  const [isClosed, setIsClosed] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  // 增加延时显示，更有动感
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500)
    return () => clearTimeout(timer)
  }, [])

  if (isClosed || price.target_reached) return null

  return (
      <div
          className={clx(
              "fixed z-[100] transition-all duration-700 ease-in-out",
              // 手机端：底部横跨
              "bottom-0 left-0 right-0 w-full p-4 md:p-0",
              // 桌面端：右下角卡片
              "md:bottom-8 md:right-8 md:left-auto md:w-[360px]",
              isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          )}
      >
        <div className="bg-white border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.08)] p-5 md:p-6 relative overflow-hidden">
          {/* 关闭按钮 */}
          <button
              onClick={() => setIsClosed(true)}
              className="absolute top-3 right-3 text-gray-400 hover:text-black transition-colors"
          >
            <XMark className="w-4 h-4" />
          </button>

          <div className="flex flex-col gap-y-4">
            <div className="space-y-1">
              <h4 className="text-[11px] uppercase tracking-[0.2em] font-bold text-gray-900">
                Complimentary Shipping
              </h4>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                You are only <span className="text-black font-bold">
                {convertToLocale({ amount: price.target_remaining, currency_code: cart.currency_code })}
              </span> away from free delivery.
              </p>
            </div>

            {/* 进度条 */}
            <div className="w-full h-[3px] bg-gray-100 rounded-full overflow-hidden">
              <div
                  className="h-full bg-black transition-all duration-1000 ease-out"
                  style={{ width: `${price.remaining_percentage}%` }}
              />
            </div>

            <div className="flex gap-x-3 mt-1">
              <LocalizedClientLink
                  href="/cart"
                  className="flex-1 text-[10px] uppercase tracking-widest text-center py-3 border border-gray-200 hover:border-black transition-all duration-300"
              >
                Bag
              </LocalizedClientLink>
              <LocalizedClientLink
                  href="/store"
                  className="flex-1 text-[10px] uppercase tracking-widest text-center py-3 bg-black text-white hover:bg-gray-800 transition-all duration-300"
              >
                Continue
              </LocalizedClientLink>
            </div>
          </div>
        </div>
      </div>
  )
}