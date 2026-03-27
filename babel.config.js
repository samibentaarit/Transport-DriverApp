module.exports = function (api) {
  api.cache(true);

  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["."],
          alias: {
            "@": "./src",
            "@expo/log-box/src/logbox-web-polyfill": "./src/shims/LogBoxWebPolyfill"
          }
        }
      ],
      "react-native-reanimated/plugin"
    ]
  };
};
