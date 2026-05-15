import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "uiez8a3cxaj4q4wl.public.blob.vercel-storage.com",
        port: "",
        pathname: "/**",
      }
    ]
  },
  experimental: {
    serverActions: {
      allowedOrigins: process.env.NODE_ENV === "development" ? ["localhost:3000", process.env.DEV_URL ?? "localhost:3000"] : undefined,
    }
  },
  async headers() {
    return [
      {
        source: "/api/auth/:path*",
        has: [
          {
            type: 'host',
            value: 'localhost:5173',
          },
        ],
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "http://localhost:5173",
          },
          {
            key: "Access-Control-Allow-Credentials",
            value: "true",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
      {
        source: "/api/auth/:path*",
        has: [
          {
            type: 'host',
            value: 'beta.joutes.app',
          },
        ],
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "https://beta.joutes.app",
          },
          {
            key: "Access-Control-Allow-Credentials",
            value: "true",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
