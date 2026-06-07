import type { NextConfig } from "next";

// В dev: http://localhost:3000 — запросы и так same-origin, заголовок не мешает
// В prod: https://oumiroll.fr — браузер заблокирует запросы с чужих сайтов
const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").trim();

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.37"],

  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin",  value: appUrl },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PATCH,DELETE,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type,Authorization,stripe-signature" },
        ],
      },
    ];
  },
};

export default nextConfig;
