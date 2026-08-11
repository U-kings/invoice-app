import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  serverExternalPackages: ["@repo/db", "pg"],
  transpilePackages: ["@workspace/ui"],
  reactStrictMode: true,
}

export default nextConfig
