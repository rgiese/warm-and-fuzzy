const { getDefaultConfig } = require("metro-config");

const fs = require("fs");
const path = require("path");
const getDevPaths = require("get-dev-paths");

module.exports = (async () => {
  const {
    resolver: { sourceExts, assetExts },
  } = await getDefaultConfig();

  const isCircleCI = !!process.env["CIRCLE_BRANCH"];

  const ciOverrides = isCircleCI
    ? {
        // https://stackoverflow.com/questions/56002938/reactnative-0-59-x-build-fails-on-circleci-with-exit-value-137/56027775#56027775
        maxWorkers: 2,
      }
    : {};

  return {
    ...ciOverrides,
    resolver: {
      // https://github.com/kristerkari/react-native-svg-transformer
      assetExts: assetExts.filter(ext => ext !== "svg"),
      sourceExts: [...sourceExts, "svg"],
      // Completely bananas work-around for https://github.com/facebook/metro/issues/1
      // courtesy of https://github.com/facebook/metro/issues/1#issuecomment-453450709
      extraNodeModules: new Proxy(
        {},
        {
          get: (target, name) => path.join(process.cwd(), `node_modules/${name}`),
        }
      ),
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
