const path = require("path");
const slsw = require("serverless-webpack");
const nodeExternals = require("webpack-node-externals");

module.exports = {
  mode: slsw.lib.webpack.isLocal ? "development" : "production",
  entry: slsw.lib.entries,
  externals: [nodeExternals()],
  devtool: "source-map",
  resolve: {
    // c.f. https://github.com/graphql/graphql-js/issues/1272, need to list .mjs prior to .js
    extensions: [".mjs", ".js", ".jsx", ".json", ".ts", ".tsx"],
  },
  output: {
    libraryTarget: "commonjs",
    path: path.join(__dirname, ".webpack"),
    filename: "[name].js",
  },
  stats: "minimal",
  target: "node",
  module: {
    rules: [
      { test: /\.(graphql|gql)$/, exclude: /node_modules/, loader: "graphql-tag/loader" },
      { test: /\.tsx?$/, loader: "ts-loader" },
    ],
  },
};
