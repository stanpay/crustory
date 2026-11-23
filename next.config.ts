import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tailwind@turbopack 4.3.3은 CSS가 한 버전 늦게 나오는 버그가 있음 → 4.3.4+ 필수
  // 파일시스템 캐시가 오래된 globals.css chunk를 붙잡는 경우도 있어 dev에서는 끔
  experimental: {
    turbopackFileSystemCacheForDev: false,
  },
  turbopack: {
    root: __dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
