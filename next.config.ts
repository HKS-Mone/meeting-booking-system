import type { NextConfig } from "next";

// Stamped once per build. Used by DeploymentWatcher to detect new deployments.
const BUILD_STAMP = Date.now().toString();

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: "standalone",
  generateBuildId: async () => BUILD_STAMP,
  env: {
    NEXT_PUBLIC_BUILD_ID: BUILD_STAMP,
  },
};

export default nextConfig;
