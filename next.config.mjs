/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  eslint: {
    ignoreDuringBuilds: true
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
        port: "",
        pathname: "/**"
      }
    ]
  },

  // Optimize for client-side navigation
  poweredByHeader: false,

  // Handle browser API polyfills for SSR
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Disable browser-only modules during SSR
      config.resolve.fallback = {
        ...config.resolve.fallback,
        "idb-keyval": false,
        indexeddb: false,
        crypto: false,
        stream: false,
        util: false
      };

      // Ignore WalletConnect and web3 modules during SSR
      config.externals = config.externals || [];
      config.externals.push({
        "@walletconnect/core": "commonjs @walletconnect/core",
        "@walletconnect/ethereum-provider":
          "commonjs @walletconnect/ethereum-provider",
        "@walletconnect/modal": "commonjs @walletconnect/modal"
      });
    }
    return config;
  }
};

export default nextConfig;
