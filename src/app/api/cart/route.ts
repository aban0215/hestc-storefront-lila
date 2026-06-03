import { retrieveCart } from "@lib/data/cart"
import { NextResponse } from "next/server"

/**
 * GET /api/cart — 客户端组件获取 cart 数据（API routes 不影响页面 ISR）
 */
export async function GET() {
  try {
    const cart = await retrieveCart()
    return NextResponse.json({ cart })
  } catch {
    return NextResponse.json({ cart: null })
  }
}
