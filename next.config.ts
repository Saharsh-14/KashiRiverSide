import type { NextConfig } from "next";
const config: NextConfig = { distDir: process.env.VERCEL ? ".next" : process.env.NEXT_DIST_DIR || ".next-build" };
export default config;
