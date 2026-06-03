const checkEnvVariables = require("./check-env-variables")

checkEnvVariables()

/**
 * Medusa Cloud-related environment variables
 */
const S3_HOSTNAME = process.env.MEDUSA_CLOUD_S3_HOSTNAME
const S3_PATHNAME = process.env.MEDUSA_CLOUD_S3_PATHNAME

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: false,
    remotePatterns: [
      // 本地开发
      {
        protocol: "http",
        hostname: "localhost",
      },
      // Medusa 后端 + CDN
      {
        protocol: "https",
        hostname: "abanopen.tech",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "abanopen.tech",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.abanopen.tech",
        pathname: "/**",
      },
      // Strapi CMS
      {
        protocol: "https",
        hostname: "abanopencms.tech",
        pathname: "/**",
      },
      // 阿里云 OSS（直接访问）
      {
        protocol: "https",
        hostname: "hestc-medusa.oss-us-east-1.aliyuncs.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "hestc-medusa.oss-us-east-1.aliyuncs.com",
        pathname: "/**",
      },
      ...(S3_HOSTNAME && S3_PATHNAME
          ? [
            {
              protocol: "https",
              hostname: S3_HOSTNAME,
              pathname: S3_PATHNAME,
            },
          ]
          : []),
    ],
  },
}

module.exports = nextConfig