/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: { appDir: true },
  transpilePackages: ['antd'],
  // pageExtensions: [
  //   "page.mdx",
  //   "page.md",
  //   "page.jsx",
  //   "page.js",
  //   "page.tsx",
  //   "page.ts",
  //   "api.js",
  //   "api.ts",
  // ],
};

module.exports = nextConfig;
