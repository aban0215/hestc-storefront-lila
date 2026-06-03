/**
 * 客户端组件占位。原服务端 CartMismatchBanner / FreeShippingPriceNudge
 * 改为客户端渲染后暂时降级为 null，等认证模块改造时一并恢复。
 *
 * 移除此处的服务端 cookies() 调用是为了解除 Next.js ISR 禁用。
 */
export default function CartUserOverlay() {
  return null
}
