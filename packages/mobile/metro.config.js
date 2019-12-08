const { getDefaultConfig } = require("metro-config");

const fs = require("fs");
const getDevPaths = require("get-dev-paths");

module.exports = (async () => {
  const {
    resolver: { sourceExts, assetExts },
  } = await getDefaultConfig();

  return {
    resolver: {
      // https://github.com/kristerkari/react-native-svg-transformer
      assetExts: assetExts.filter(ext => ext !== "svg"),
      sourceExts: [...sourceExts, "svg"],
    },
    transformer: {
      babelTransformerPath: require.resolve("react-native-svg-transformer"),
      getTransformOptions: async () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: false,
        },
      }),
    },
    // Completely bananas work-around for https://github.com/facebook/metro/issues/1
    // courtesy of https://github.com/facebook/metro/issues/1#issuecomment-421628147
    watchFolders: Array.from(new Set(getDevPaths(__dirname).map($ => fs.realpathSync($)))),
  };
})();
