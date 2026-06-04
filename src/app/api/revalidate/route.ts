import { revalidateTag } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

const SECRET = process.env.REVALIDATION_SECRET || "yunjoy-revalidate-2026"

/**
 * On-demand cache revalidation endpoint.
 * Usage: GET /api/revalidate?tag=hero&secret=yunjoy-revalidate-2026
 * Tags: hero, categories, collections, menu, footer, pages, seo, marketing
 */
export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret")
  const tag = request.nextUrl.searchParams.get("tag")

  if (secret !== SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 })
  }

  if (!tag) {
    return NextResponse.json({ error: "Missing tag parameter" }, { status: 400 })
  }

  revalidateTag(tag)
  return NextResponse.json({ revalidated: true, tag, now: Date.now() })
}
