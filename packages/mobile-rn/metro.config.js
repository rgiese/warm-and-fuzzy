/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

// Completely bananas work-around for  https://github.com/facebook/metro/issues/1
// courtesy of https://github.com/facebook/metro/issues/1#issuecomment-421628147
const fs = require("fs");
const getDevPaths = require("get-dev-paths");

module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
  watchFolders: Array.from(new Set(getDevPaths(__dirname).map($ => fs.realpathSync($)))),
};
