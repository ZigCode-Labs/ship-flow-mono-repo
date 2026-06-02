import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: true,
  transpilePackages: ['@shipflow/shared', '@shipflow/ui-forms', '@shipflow/ui-table'],
};

export default nextConfig;
