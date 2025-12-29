import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "styles/globals.css"


export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light">
      <body>
        <main className="relative">{props.children}</main>

        <script
            dangerouslySetInnerHTML={{
                __html: `
      (function() {
        var noop = function() {};
        window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = window.__REACT_DEVTOOLS_GLOBAL_HOOK__ || {
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
      </body>
    </html>
  )
}
