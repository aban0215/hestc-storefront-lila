"use client"

import { useEffect, useState } from "react"
import CartDropdown from "../cart-dropdown"

/**
 * 客户端组件：按需拉取 cart 数据。
 * 不在服务端调用 retrieveCart()（会触发 cookies() 禁用 ISR），
 * 改为 mount 后通过 API 获取。
 */
export default function CartButton() {
  const [cart, setCart] = useState<any>(undefined)

  useEffect(() => {
    async function loadCart() {
      try {
        // 通过内部 API 获取 cart（不走 cookies，由 API route 处理）
        const res = await fetch("/api/cart")
        if (res.ok) {
          const data = await res.json()
          setCart(data.cart ?? null)
        } else {
          setCart(null)
        }
      } catch {
        setCart(null)
      }
    }
    loadCart()
  }, [])

  // 加载中返回占位，与 Suspense fallback 保持一致
  if (cart === undefined) {
    return <div className="w-9 h-9" />
  }

  return <CartDropdown cart={cart} />
}
