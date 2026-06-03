import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "styles/globals.css"
import { getGlobalSeoSetting } from "@lib/strapi/seo";
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from "@vercel/analytics/next"
import AnnouncementBar from "../modules/layout/announcement-bar"
import { getAnnouncements } from "@lib/get-announcements"
import Script from "next/script"
import FBPixelNavigation from "./components/fb-pixel-nav";
import { Suspense } from "react"

export async function generateMetadata(): Promise<Metadata> {
    const globalSeo = await getGlobalSeoSetting();

    return {
        metadataBase: new URL(getBaseURL()),
        icons: {
            icon: globalSeo?.favicon || "/favicon.ico",
            apple: globalSeo?.favicon || "/favicon.ico",
        },
        title: {
            template: `%s | ${globalSeo?.siteName || "YunJoy"}`,
            default: globalSeo?.defaultSeo?.metaTitle || "YunJoy",
        },
        description: globalSeo?.defaultSeo?.metaDescription,
        keywords: globalSeo?.defaultSeo?.keywords,
        openGraph: {
            title: globalSeo?.defaultSeo?.metaTitle || "YunJoy",
            description: globalSeo?.defaultSeo?.metaDescription,
            images: globalSeo?.favicon ? [globalSeo.favicon] : [],
        },
        appleWebApp: {
            capable: true,
            title: globalSeo?.siteName || "YunJoy",
            statusBarStyle: "black-translucent",
        },
        manifest: "/manifest.json",
        other: {
            "mobile-web-app-capable": "yes",
        },
    };
}

export const viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#ffffff" },
        { media: "(prefers-color-scheme: dark)", color: "#111827" },
    ],
    viewportFit: "cover",
};

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

            {/* --- Meta Pixel Code (Base Code) --- */}
            <Script id="fb-pixel" strategy="afterInteractive">
                {`
                        !function(f,b,e,v,n,t,s)
                        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                        n.queue=[];t=b.createElement(e);t.async=!0;
                        t.src=v;s=b.getElementsByTagName(e)[0];
                        s.parentNode.insertBefore(t,s)}(window, document,'script',
                        'https://connect.facebook.net/en_US/fbevents.js');
                        fbq('init', '1485916962882743');
                        fbq('track', 'PageView');
                    `}
            </Script>
            {/* --- End Meta Pixel Code --- */}
        </head>
        <body className="relative" suppressHydrationWarning>
        {/* Meta Pixel NoScript 备用方案 */}
        <noscript>
            <img
                height="1"
                width="1"
                style={{ display: "none" }}
                src="https://www.facebook.com/tr?id=1485916962882743&ev=PageView&noscript=1"
            />
        </noscript>

        <AnnouncementBar announcements={announcements} />
        <main>{props.children}</main>
        <SpeedInsights />
        <Analytics />

        <Suspense fallback={null}>
            <FBPixelNavigation />
        </Suspense>

        </body>
        </html>
    )
}