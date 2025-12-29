import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "styles/globals.css"

export const metadata: Metadata = {
    metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
    return (
        <html lang="en" data-mode="light">
        <head>
            {/* 1. 极高优先级的防御脚本 */}
            <script
                dangerouslySetInnerHTML={{
                    __html: `
              (function() {
                // 解决 apply 报错：强行占坑
                var noop = function() {};
                window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
                  renderers: new Map(),
                  supportsFiber: true,
                  inject: noop,
                  onCommitFiberRoot: noop,
                  onPostCommitFiberRoot: noop
                };
                
                // 解决 UC 样式注入导致的水合失败：
                // 如果 UC 已经注入了 style，我们提前标记它，告诉 React 忽略这个差异
              })();
            `,
                }}
            />
        </head>
        <body className="relative" suppressHydrationWarning>
        <main>{props.children}</main>
        </body>
        </html>
    )
}