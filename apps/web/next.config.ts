import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@marketmap/domain", "@marketmap/contracts"],
  agentRules: false,
};

export default nextConfig;
