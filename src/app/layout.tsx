import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "styles/globals.css"
import { getGlobalSeoSetting } from "@lib/strapi/seo";


export async function generateMetadata(): Promise<Metadata> {
    const globalSeo = await getGlobalSeoSetting();

    return {
        // 将 metadataBase 移入此处
        metadataBase: new URL(getBaseURL()),

        // 网站图标：处理 Strapi 返回的数组
        icons: {
            icon: globalSeo?.favicon || "/favicon.ico",
        },

        // 标题模板
        title: {
            template: `%s | ${globalSeo?.siteName || "Lila Zen"}`,
            default: globalSeo?.defaultSeo?.metaTitle || "Lila Zen",
        },
        description: globalSeo?.defaultSeo?.metaDescription,
        keywords: globalSeo?.defaultSeo?.keywords,

        // 建议加上：基础的 OpenGraph 设置（防止社交分享显示为空）
        openGraph: {
            title: globalSeo?.defaultSeo?.metaTitle || "Lila Zen",
            description: globalSeo?.defaultSeo?.metaDescription,
            images: globalSeo?.favicon ? [globalSeo.favicon] : [],
        }
    };
}

export default function RootLayout(props: { children: React.ReactNode }) {
    return (
        <html lang="en" data-mode="light">
        <head>
            {/* 这里的脚本保持不变，它能有效处理你提到的 React DevTools 和 UC 浏览器导致的水合问题 */}
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
        {/* 注意：suppressHydrationWarning 放在 html 或 body 上都是可以的，
            针对第三方插件（如翻译、主题、UC浏览器）注入样式导致的差异，
            放在 body 上比较常见 */}
        <body className="relative" suppressHydrationWarning>
        <main>{props.children}</main>
        </body>
        </html>
    )
}