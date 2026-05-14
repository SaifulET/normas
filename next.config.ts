import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "norman-bucket-file.s3.eu-north-1.amazonaws.com",
        pathname: "/lists/**",
      },
    ],
  },
};

export default nextConfig;
