/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  basePath: "/generate-poems",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
};

// ESM 导出（适配 "type": "module"）
export default nextConfig;