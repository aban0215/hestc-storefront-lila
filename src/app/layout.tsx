import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "styles/globals.css"


// 防御 UC 浏览器注入脚本崩溃的补丁
if (typeof window !== "undefined") {
    (function() {
        const noop = () => {};
        // 如果浏览器注入了有问题的钩子，我们手动把它修复成安全的空函数
        if (!(window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
            (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
                renderers: new Map(),
                supportsFiber: true,
                inject: noop,
                onCommitFiberRoot: noop, // 针对报错的针对性修复
                onPostCommitFiberRoot: noop,
            };
        } else {
            // 如果钩子已存在，确保报错的那个函数不会由于 undefined 而崩溃
            const hook = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
            if (typeof hook.onCommitFiberRoot !== 'function') {
                hook.onCommitFiberRoot = noop;
            }
        }
    })();
}

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light">
      <body>
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
