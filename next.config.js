const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["antd"],
  sassOptions: {
    includePaths: [path.join(__dirname, "src/assets/styles")],
  },
};

module.exports = nextConfig;
