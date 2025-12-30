import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "styles/globals.css"
import { getGlobalSeoSetting } from "@lib/strapi/seo";
import { headers } from "next/headers"; // 新增：用于读取 Middleware 注入的 Header
import CountrySuggestionBanner from "../app/components/country-suggestion-banner"; // 假设的组件路径

export async function generateMetadata(): Promise<Metadata> {
    const globalSeo = await getGlobalSeoSetting();

    return {
        metadataBase: new URL(getBaseURL()),
        icons: {
            icon: globalSeo?.favicon || "/favicon.ico",
        },
        title: {
            template: `%s | ${globalSeo?.siteName || "Lila Zen"}`,
            default: globalSeo?.defaultSeo?.metaTitle || "Lila Zen",
        },
        description: globalSeo?.defaultSeo?.metaDescription,
        keywords: globalSeo?.defaultSeo?.keywords,
        openGraph: {
            title: globalSeo?.defaultSeo?.metaTitle || "Lila Zen",
            description: globalSeo?.defaultSeo?.metaDescription,
            images: globalSeo?.favicon ? [globalSeo.favicon] : [],
        }
    };
}

export default async function RootLayout(props: { children: React.ReactNode }) {
    // 1. 获取 Headers
    const headersList = await headers();

    // 2. 读取我们在 Middleware 中设置的检测到的国家
    // 如果没有值，则默认为空
    const detectedCountry = headersList.get("x-detected-country") || "";
    console.log("--- Layout Received Header:", detectedCountry);
    return (
        <html lang="en" data-mode="light">
        <head>
            <script
                dangerouslySetInnerHTML={{
                    __html: `
              (function() {
                var noop = function() {};
                window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
                  renderers: new Map(),
                  supportsFiber: true,
                  inject: noop,
                  onCommitFiberRoot: noop,
                  onPostCommitFiberRoot: noop
                };
              })();
            `,
                }}
            />
        </head>
        <body className="relative" suppressHydrationWarning>
        {/* 3. 渲染检测组件：将识别到的国家代码传给客户端 */}
        {detectedCountry && (
            <CountrySuggestionBanner detectedCountry={detectedCountry} />
        )}

        <main>{props.children}</main>
        </body>
        </html>
    )
}