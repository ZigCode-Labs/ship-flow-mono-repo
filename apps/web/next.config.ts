import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: true,
  transpilePackages: ['@shipflow/shared', '@shipflow/ui-forms', '@shipflow/ui-table'],
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
