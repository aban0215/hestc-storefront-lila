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

  // 1. 爬虫识别逻辑：防止对搜索引擎爬虫进行任何 Cookie 操作或跳转干扰
  const isBot = /googlebot|bingbot|baiduspider|twitterbot|facebookexternalhit/i.test(userAgent)

  let cacheIdCookie = request.cookies.get("_medusa_cache_id")
  let cacheId = cacheIdCookie?.value || crypto.randomUUID()

  // 2. 获取 Region 地图数据
  const regionMap = await getRegionMap(cacheId)
  const countryCode = regionMap && (await getCountryCode(request, regionMap))

  const urlCountryCode = pathname.split("/")[1]?.toLowerCase()
  const urlHasCountryCode = countryCode && urlCountryCode && regionMap.has(urlCountryCode)

  // 3. 针对爬虫的特殊处理：如果 URL 已经符合规范且是爬虫，直接放行，不设 Cookie
  if (isBot && urlHasCountryCode) {
    return NextResponse.next()
  }

  // 4. 处理正常用户的 Cookie 和逻辑
  if (urlHasCountryCode) {
    const response = NextResponse.next()

    // 如果没有 cache id，设置它（仅针对真人用户）
    if (!cacheIdCookie) {
      response.cookies.set("_medusa_cache_id", cacheId, {
        maxAge: 60 * 60 * 24,
      })
    }

    // 关键：将 IP 检测到的国家注入 Header
    const detectedCountry = request.headers.get("x-vercel-ip-country")?.toLowerCase()
    if (detectedCountry) {
      response.headers.set("x-detected-country", detectedCountry)
    }

    return response
  }

  // 5. 检查是否为静态资源
  if (pathname.includes(".")) {
    return NextResponse.next()
  }

  // 6. 重定向逻辑：当 URL 没有任何国家代码时 (例如访问 / 或 /cart)
  const redirectPath = pathname === "/" ? "" : pathname
  const queryString = request.nextUrl.search ? request.nextUrl.search : ""

  if (!urlHasCountryCode && countryCode) {
    const redirectUrl = `${request.nextUrl.origin}/${countryCode}${redirectPath}${queryString}`
    const response = NextResponse.redirect(redirectUrl, 307)

    response.cookies.set("_medusa_cache_id", cacheId, {
      maxAge: 60 * 60 * 24,
    })

    return response
  } else if (!urlHasCountryCode && !countryCode) {
    return new NextResponse(
        "No valid regions configured. Please set up regions in your Medusa Admin.",
        { status: 500 }
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|assets|png|svg|jpg|jpeg|gif|webp).*)",
  ],
}