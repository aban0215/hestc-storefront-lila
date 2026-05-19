const LOCALHOST_MEDUSA = "http://localhost:9000"
const PUBLIC_MEDUSA = "http://abanopen.tech"

/**
 * 将 Medusa 返回的 localhost:9000 图片 URL 替换为公开可访问的 URL
 */
export function normalizeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null

  const backendUrl = process.env.MEDUSA_BACKEND_URL
    || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
    || PUBLIC_MEDUSA

  if (url.startsWith(LOCALHOST_MEDUSA)) {
    return url.replace(LOCALHOST_MEDUSA, backendUrl.replace(/\/$/, ""))
  }

  return url
}
