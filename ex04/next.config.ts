import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 패키지(node_modules)는 ex 폴더마다 두지 않고 day2_vibe 폴더에 한 번만 설치함
  turbopack: { root: path.join(__dirname, "..") },
  // npm run dev가 CLAUDE.md에 Next.js 안내를 자동으로 덧붙이지 않게 함(수강생용 규칙 파일을 그대로 유지)
  agentRules: false,
};

export default nextConfig;
