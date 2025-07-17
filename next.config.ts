import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "s3.sro.my.id" },
      { protocol: "https", hostname: "s3-dev.sro.my.id" },
      { protocol: "https", hostname: "dummyimage.com" },
    ],
  },
};

export default nextConfig;
