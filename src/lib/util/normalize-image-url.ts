const DEFAULT_LOCALHOST_URL = "http://localhost:9000"

/**
 * 将 Medusa 返回的 localhost:9000 图片 URL 替换为公开可访问的 URL
 * 浏览器端访问不到 localhost:9000（Medusa 在远程服务器上），
 * 需要替换为 MEDUSA_BACKEND_URL（如 http://abanopen.tech），nginx 会转发 /static/ 请求
 */
export function normalizeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null

  const backendUrl = process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL

  if (backendUrl && url.startsWith(DEFAULT_LOCALHOST_URL)) {
    return url.replace(DEFAULT_LOCALHOST_URL, backendUrl.replace(/\/$/, ""))
  }

  return url
}
