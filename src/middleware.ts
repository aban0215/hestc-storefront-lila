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
      if (!response.ok) throw new Error(json.message)
      return json
    })

    if (!regions?.length) {
      throw new Error("No regions found. Please set up regions in your Medusa Admin.")
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
    const vercelCountryCode = request.headers.get("x-vercel-ip-country")?.toLowerCase()
    const urlCountryCode = request.nextUrl.pathname.split("/")[1]?.toLowerCase()

    if (urlCountryCode && regionMap.has(urlCountryCode)) {
      countryCode = urlCountryCode
    } else if (vercelCountryCode && regionMap.has(vercelCountryCode)) {
      countryCode = vercelCountryCode
    } else if (regionMap.has(DEFAULT_REGION)) {
      countryCode = DEFAULT_REGION
    } else {
      countryCode = regionMap.keys().next().value
    }

    return countryCode
  } catch (error) {
    return DEFAULT_REGION
  }
}

export async function middleware(request: NextRequest) {
  // 1. 静态资源直接放行
  if (request.nextUrl.pathname.includes(".")) {
    return NextResponse.next()
  }

  let cacheIdCookie = request.cookies.get("_medusa_cache_id")
  let cacheId = cacheIdCookie?.value || crypto.randomUUID()
  const regionMap = await getRegionMap(cacheId)
  const countryCode = regionMap && (await getCountryCode(request, regionMap))

  const urlParts = request.nextUrl.pathname.split("/")
  const urlCountryCode = urlParts[1]?.toLowerCase()

  // 2. 核心判断：当前路径是否已经包含了合法的国家码
  const urlHasValidCountryCode = countryCode && urlCountryCode === countryCode

  // 如果路径合法且有缓存 ID，直接通过
  if (urlHasValidCountryCode && cacheIdCookie) {
    return NextResponse.next()
  }

  // 如果路径合法但没缓存 ID，种下 Cookie 并重定向（防止循环）
  if (urlHasValidCountryCode && !cacheIdCookie) {
    const response = NextResponse.redirect(request.nextUrl.href, 307)
    response.cookies.set("_medusa_cache_id", cacheId, { maxAge: 60 * 60 * 24 })
    return response
  }

  // 3. 路径清理逻辑：处理无效国家码（比如 /hk）
  // 如果路径第一段不是空的，且它不在合法的 regionMap 里，说明这是一个无效的“假国家码”
  const isInvalidCountryInPath = urlCountryCode && !regionMap.has(urlCountryCode)

  let cleanPath = request.nextUrl.pathname
  if (isInvalidCountryInPath) {
    // 抠掉无效的国家码，把 /hk/products 变成 /products
    cleanPath = "/" + urlParts.slice(2).join("/")
  }

  // 整理重定向的最终路径
  const redirectPath = cleanPath === "/" ? "" : cleanPath
  const queryString = request.nextUrl.search || ""

  if (countryCode) {
    const redirectUrl = `${request.nextUrl.origin}/${countryCode}${redirectPath}${queryString}`
    const response = NextResponse.redirect(redirectUrl, 307)

    if (!cacheIdCookie) {
      response.cookies.set("_medusa_cache_id", cacheId, { maxAge: 60 * 60 * 24 })
    }
    return response
  }

  return new NextResponse(
      "No valid regions configured. Please set up regions in Medusa Admin.",
      { status: 500 }
  )
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|assets|png|svg|jpg|jpeg|gif|webp).*)",
  ],
}