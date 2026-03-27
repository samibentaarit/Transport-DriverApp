const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);
const logBoxWebPolyfillPath = path.resolve(__dirname, "src/shims/LogBoxWebPolyfill.tsx");
const zustandMiddlewarePath = path.resolve(__dirname, "node_modules/zustand/middleware.js");

config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules ?? {}),
  "@expo/log-box/src/logbox-web-polyfill": logBoxWebPolyfillPath,
  "zustand/middleware": zustandMiddlewarePath
};

module.exports = config;
