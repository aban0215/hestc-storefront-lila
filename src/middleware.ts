import { HttpTypes } from "@medusajs/types"
import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL
const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "us"

const regionMapCache = {
  regionMap: new Map<string, HttpTypes.StoreRegion>(),
  regionMapUpdated: Date.now(),
}

async function getRegionMap(cacheId: string) {
  const { regionMap, regionMapUpdated } = regionMapCache

  if (!BACKEND_URL) {
    throw new Error(
        "Middleware.ts: Error fetching regions. Did you set up regions in your Medusa Admin and define a MEDUSA_BACKEND_URL environment variable?"
    )
  }

  // 1小时缓存失效逻辑
  if (
      !regionMap.keys().next().value ||
      regionMapUpdated < Date.now() - 3600 * 1000
  ) {
    const { regions } = await fetch(`${BACKEND_URL}/store/regions`, {
      headers: {
        "x-publishable-api-key": PUBLISHABLE_API_KEY!,
      },
      next: {
        revalidate: 3600,
        // 修复点：确保标签永远不是空字符串，防止 SuspenseCacheAPI 400 错误
        tags: [`regions-${cacheId || 'default'}`],
      },
      cache: "force-cache",
    }).then(async (response) => {
      const json = await response.json()
      if (!response.ok) {
        throw new Error(json.message)
      }
      return json
    })

    if (!regions?.length) {
      throw new Error(
          "No regions found. Please set up regions in your Medusa Admin."
      )
    }

    // 清空旧 Map 重新填充
    regionMapCache.regionMap.clear()
    regions.forEach((region: HttpTypes.StoreRegion) => {
      region.countries?.forEach((c) => {
        // 修复点：强制转为小写存入，解决后端大写 US 无法匹配前端小写 us 的问题
        const code = c.iso_2?.toLowerCase()
        if (code) {
          regionMapCache.regionMap.set(code, region)
        }
      })
    })

    regionMapCache.regionMapUpdated = Date.now()
  }

  return regionMapCache.regionMap
}

/**
 * 获取目标国家码逻辑
 */
async function getCountryCode(
    request: NextRequest,
    regionMap: Map<string, HttpTypes.StoreRegion>
) {
  try {
    const urlCountryCode = request.nextUrl.pathname.split("/")[1]?.toLowerCase()

    // 1. 如果 URL 中已经有合法国家码，直接使用它
    if (urlCountryCode && regionMap.has(urlCountryCode)) {
      return urlCountryCode
    }

    // 2. 核心逻辑：跳转到 DEFAULT_REGION (us)
    // 此时 regionMap 已归一化，可以安全匹配 "us"
    if (regionMap.has(DEFAULT_REGION)) {
      return DEFAULT_REGION
    }

    // 3. 兜底逻辑
    return regionMap.keys().next().value
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Middleware.ts: Error getting the country code.", error)
    }
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const userAgent = request.headers.get("user-agent") || ""
  const isBot = /googlebot|bingbot|baiduspider|twitterbot|facebookexternalhit/i.test(userAgent)

  // 修复点：确保 cacheId 稳定性
  const cacheIdCookie = request.cookies.get("_medusa_cache_id")
  const cacheId = cacheIdCookie?.value || crypto.randomUUID()

  try {
    const regionMap = await getRegionMap(cacheId)
    if (!regionMap || regionMap.size === 0) return NextResponse.next()

    const urlCountryCode = pathname.split("/")[1]?.toLowerCase()
    const urlHasCountryCode = urlCountryCode && regionMap.has(urlCountryCode)
    const vercelDetectedCountry = request.headers.get("x-vercel-ip-country")?.toLowerCase()

    // 情况 1: 用户访问了一个无效的国家码 (如 /cn)，重定向到 /us
    if (urlCountryCode && !regionMap.has(urlCountryCode)) {
      const redirectPath = pathname.replace(`/${urlCountryCode}`, "") || ""
      const queryString = request.nextUrl.search || ""
      const redirectUrl = `${request.nextUrl.origin}/${DEFAULT_REGION}${redirectPath}${queryString}`
      return NextResponse.redirect(redirectUrl, 307)
    }

    if (isBot && urlHasCountryCode) return NextResponse.next()

    // 情况 2: URL 已经有合法的国家码了
    if (urlHasCountryCode) {
      const response = NextResponse.next()
      if (vercelDetectedCountry) {
        response.headers.set("x-detected-country", vercelDetectedCountry)
      }
      response.headers.set("x-current-country", urlCountryCode)
      return response
    }

    // 排除静态资源和 API
    if (pathname.includes(".") || pathname.startsWith("/api/")) {
      return NextResponse.next()
    }

    // 情况 3: URL 完全没有国家码，重定向到默认国家 /us
    let targetCountry = await getCountryCode(request, regionMap as any)
    if (targetCountry) {
      const redirectPath = pathname === "/" ? "" : pathname
      const queryString = request.nextUrl.search ? request.nextUrl.search : ""
      const redirectUrl = `${request.nextUrl.origin}/${targetCountry}${redirectPath}${queryString}`

      const response = NextResponse.redirect(redirectUrl, 307)
      if (vercelDetectedCountry) {
        response.headers.set("x-detected-country", vercelDetectedCountry)
      }
      return response
    }
  } catch (error) {
    console.error("Middleware Error:", error)
    return NextResponse.next()
  }
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|assets|png|svg|jpg|jpeg|gif|webp).*)",
  ],
}