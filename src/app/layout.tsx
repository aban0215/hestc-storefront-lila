import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "styles/globals.css"
import { getGlobalSeoSetting } from "@lib/strapi/seo";
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from "@vercel/analytics/next"
import AnnouncementBar from "../modules/layout/announcement-bar"
import { getAnnouncements } from "@lib/get-announcements"

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

export default async function RootLayout(props: { children: React.ReactNode }) {

    const announcements = await getAnnouncements()

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
        {/* 3. 现在传给组件的就是真实的 array 数据了 */}
        <AnnouncementBar announcements={announcements} />
        <main>{props.children}</main>
        <SpeedInsights />
        <Analytics />
        </body>
        </html>
    )
}