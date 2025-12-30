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
        tags: [`regions-${cacheId}`],
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

    regions.forEach((region: HttpTypes.StoreRegion) => {
      region.countries?.forEach((c) => {
        regionMapCache.regionMap.set(c.iso_2 ?? "", region)
      })
    })

    regionMapCache.regionMapUpdated = Date.now()
  }

  return regionMapCache.regionMap
}

async function getCountryCode(
    request: NextRequest,
    regionMap: Map<string, HttpTypes.StoreRegion | number>
) {
  try {
    let countryCode

    const vercelCountryCode = request.headers
        .get("x-vercel-ip-country")
        ?.toLowerCase()

    const urlCountryCode = request.nextUrl.pathname.split("/")[1]?.toLowerCase()

    if (urlCountryCode && regionMap.has(urlCountryCode)) {
      countryCode = urlCountryCode
    } else if (vercelCountryCode && regionMap.has(vercelCountryCode)) {
      countryCode = vercelCountryCode
    } else if (regionMap.has(DEFAULT_REGION)) {
      countryCode = DEFAULT_REGION
    } else if (regionMap.keys().next().value) {
      countryCode = regionMap.keys().next().value
    }

    return countryCode
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Middleware.ts: Error getting the country code.", error)
    }
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const userAgent = request.headers.get("user-agent") || ""

  // 1. 爬虫识别逻辑
  const isBot = /googlebot|bingbot|baiduspider|twitterbot|facebookexternalhit/i.test(userAgent)

  let cacheIdCookie = request.cookies.get("_medusa_cache_id")
  let cacheId = cacheIdCookie?.value || crypto.randomUUID()

  try {
    // 2. 获取 Region 地图数据
    const regionMap = await getRegionMap(cacheId)

    // 如果获取不到 regionMap，直接放行，避免 500
    if (!regionMap || regionMap.size === 0) {
      console.error("Middleware: No regions found in Medusa.")
      return NextResponse.next()
    }

    // 3. 获取并校验国家码
    let countryCode = await getCountryCode(request, regionMap)

    // --- 核心修改：国家码合法性校验与 US 兜底 ---
    // 获取 Vercel 检测到的真实国家
    const vercelDetectedCountry = request.headers.get("x-vercel-ip-country")?.toLowerCase()

    // 如果 getCountryCode 返回的国家不在 regionMap 中，或者无法识别，统一使用 'us'
    if (!countryCode || !regionMap.has(countryCode)) {
      countryCode = 'us'
    }
    // -----------------------------------------

    const urlCountryCode = pathname.split("/")[1]?.toLowerCase()
    const urlHasCountryCode = urlCountryCode && regionMap.has(urlCountryCode)

    // 4. 针对爬虫的特殊处理
    if (isBot && urlHasCountryCode) {
      return NextResponse.next()
    }

    // 5. 处理正常用户的 Cookie 和逻辑
    if (urlHasCountryCode) {
      const response = NextResponse.next()

      if (!cacheIdCookie) {
        response.cookies.set("_medusa_cache_id", cacheId, {
          maxAge: 60 * 60 * 24,
        })
      }

      // 将检测到的国家注入 Header（给 Banner 组件使用）
      // 如果检测到的国家不在配置内，这里也建议传 'us' 或保持原样供 UI 判断
      if (vercelDetectedCountry) {
        response.headers.set("x-detected-country", vercelDetectedCountry)
      }

      // 关键：同时注入当前合法的 countryCode 到 Request Header，方便 Server Components (如 Layout) 获取
      response.headers.set("x-current-country", urlCountryCode)

      return response
    }

    // 6. 检查是否为静态资源
    if (pathname.includes(".") || pathname.startsWith("/api/")) {
      return NextResponse.next()
    }

    // 7. 重定向逻辑：当 URL 没有任何合法国家代码时
    const redirectPath = pathname === "/" ? "" : pathname
    const queryString = request.nextUrl.search ? request.nextUrl.search : ""

    if (!urlHasCountryCode && countryCode) {
      const redirectUrl = `${request.nextUrl.origin}/${countryCode}${redirectPath}${queryString}`
      const response = NextResponse.redirect(redirectUrl, 307)

      response.cookies.set("_medusa_cache_id", cacheId, {
        maxAge: 60 * 60 * 24,
      })

      return response
    }

  } catch (error) {
    // 容错处理：如果中间件执行报错（如后端 500），直接放行，不影响用户访问首页
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