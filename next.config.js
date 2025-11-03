module.exports = {
  // Skip ESLint during production builds to avoid blocking on config/version mismatches
  eslint: {
    ignoreDuringBuilds: true,
  },
  // existing config if present
  webpack: (config, { nextRuntime, isServer }) => {
    // Avoid bundling `undici` into the edge runtime (middleware) bundle.
    // The version of SWC used by Next.js fails to parse some stage-3
    // private-brand checks in Undici (e.g. `(#target in this)`).
    // Excluding it from the edge bundle sidesteps that parser error.
    if (nextRuntime === 'edge') {
      config.externals = config.externals || [];
      config.externals.push('undici');
    }

    // For both client & server bundles, alias `undici` to an empty stub –
    // the browser already provides `fetch`, and Node 18+ (or the polyfilled
    // runtime that Next uses) does as well, so we don't need Undici itself.
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      undici: false,
    };

    // Handle Node.js modules that are only needed server-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        child_process: false,
        worker_threads: false,
      };
    }

    return config;
  },
}; 