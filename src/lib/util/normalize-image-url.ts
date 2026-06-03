const LOCALHOST_MEDUSA = "http://localhost:9000"
const PUBLIC_MEDUSA = "https://abanopen.tech"

/**
 * 将 Medusa 返回的 localhost:9000 图片 URL 替换为公开可访问的 URL
 * 同时强制将 HTTP 升级为 HTTPS（修复生产环境 Mixed Content）
 */
export function normalizeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null

  const backendUrl = process.env.MEDUSA_BACKEND_URL
    || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
    || PUBLIC_MEDUSA

  if (url.startsWith(LOCALHOST_MEDUSA)) {
    url = url.replace(LOCALHOST_MEDUSA, backendUrl.replace(/\/$/, ""))
  }

  // 强制升级 HTTP → HTTPS
  if (url.startsWith("http://")) {
    url = url.replace("http://", "https://")
  }

  return url
}
