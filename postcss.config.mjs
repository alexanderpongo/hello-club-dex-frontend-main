/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
  },
  // webpack: (config) => {
  //   config.resolve.fallback = {
  //     ...config.resolve.fallback,
  //     fs: false,
  //   };
  //   return config;
  // },
};

export default config;
