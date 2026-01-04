import type { NextConfig } from "next";
import { config } from 'dotenv';
import { resolve } from 'path';

// Force load env variables from the current directory
// This fixes the issue where Next.js fails to load them due to root inference ambiguity
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

const nextConfig: NextConfig = {
  output: 'standalone', // Required for Docker/Cloud Run deployment
};

export default nextConfig;
