const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts = [
  ...config.resolver.sourceExts,
  "js",
  "jsx",
  "ts",
  "tsx",
  "cjs",
  "mjs",
];

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  path: require.resolve("path-browserify"),
  fs: require.resolve("./fs-mock.js"),
  os: require.resolve("./os-mock.js"), // Keep os mock as a fallback
  "@vercel/oidc": require.resolve("./vercel-oidc.js"),
};

config.resolver.nodeModulesPaths = [
  ...config.resolver.nodeModulesPaths,
  "./node_modules",
];

// Add blacklist to exclude @vercel/oidc
config.resolver.blacklistRE = [/node_modules\/@vercel\/oidc\/.*/];

config.transformer = {
  ...config.transformer,
  asyncRequireModulePath: require.resolve(
    "@expo/metro-config/build/async-require"
  ),
};

module.exports = withNativeWind(config, { input: "./global.css" });
