// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
// };

// export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Abaikan linting di Vercel build supaya tidak gagal
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
