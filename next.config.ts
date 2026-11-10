import type { NextConfig } from "next";

// На GitHub Pages сайт живёт в подпапке /<имя-репозитория>, поэтому при сборке
// для Pages задаётся PAGES_BASE_PATH. Локально переменной нет — сайт в корне.
const basePath = process.env.PAGES_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export", // чисто статический сайт: папка out/, сервер не нужен
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
