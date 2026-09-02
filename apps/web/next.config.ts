import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  serverExternalPackages: ["@repo/db", "pg"],
  transpilePackages: ["@workspace/ui"],
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
}

export default nextConfig
