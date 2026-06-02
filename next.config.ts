import type { NextConfig } from "next";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "norman-bucket-file.s3.eu-north-1.amazonaws.com",
        pathname: "/lists/**",
      },
      {
        protocol: "https",
        hostname: "norman-bucket-file.s3.eu-north-1.amazonaws.com",
        pathname: "/profiles/**",
      },
    ],
  },
};

export default nextConfig;
