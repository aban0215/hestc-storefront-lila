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
            {/* 1. 防御脚本必须放在 head 的最顶部 */}
            <script
                dangerouslySetInnerHTML={{
                    __html: `
              (function() {
                var noop = function() {};
                // 强制初始化或修正已被 UC 浏览器注入的损坏钩子
                if (!window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
                  window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
                    renderers: new Map(),
                    supportsFiber: true,
                    inject: noop,
                    onCommitFiberRoot: noop,
                    onPostCommitFiberRoot: noop
                  };
                } else {
                  // 如果已经存在，强行覆盖导致 apply 报错的关键方法
                  window.__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberRoot = noop;
                  window.__REACT_DEVTOOLS_GLOBAL_HOOK__.onPostCommitFiberRoot = noop;
                  window.__REACT_DEVTOOLS_GLOBAL_HOOK__.inject = noop;
                }
              })();
            `,
                }}
            />
        </head>
        <body>
        <main className="relative">{props.children}</main>
        </body>
        </html>
    )
}