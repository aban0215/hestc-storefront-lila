"use client"

import CookieConsent from "react-cookie-consent"
import Link from "next/link"

const CookieBanner = () => {
    return (
        <CookieConsent
            location="bottom"
            buttonText="Accept All"
            declineButtonText="Decline"
            enableDeclineButton
            cookieName="lilazen-consent"
            // 样式调整为更符合欧美电商的极简感
            style={{
                background: "rgba(255, 255, 255, 0.98)", // 使用白色背景，更有质感
                color: "#111", // 深色文字
                fontSize: "13px",
                boxShadow: "0 -4px 10px rgba(0,0,0,0.05)", // 加一点点阴影
                zIndex: "9999",
                padding: "15px 40px",
                display: "flex",
                alignItems: "center"
            }}
            // “接受”按钮：黑色背景，白色字
            buttonStyle={{
                backgroundColor: "#000",
                color: "#fff",
                fontSize: "12px",
                fontWeight: "600",
                borderRadius: "0px", // 欧美大牌电商多用直角
                padding: "10px 25px",
                margin: "5px"
            }}
            // “拒绝”按钮：透明背景，灰色字
            declineButtonStyle={{
                backgroundColor: "transparent",
                color: "#666",
                fontSize: "12px",
                textDecoration: "underline",
                margin: "5px"
            }}
            expires={365}
        >
            We use cookies to enhance your shopping experience. By continuing to browse, you agree to our use of cookies.{" "}
            <Link
                href="/us/pages/PrivacyPolicy"
                className="font-medium underline hover:text-gray-500 ml-1"
            >
                View Privacy Policy
            </Link>
        </CookieConsent>
    )
}

export default CookieBanner