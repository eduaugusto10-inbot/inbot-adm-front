const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = function override(config) {
  // JS sem hash
  if (config.output && config.output.filename) {
    config.output.filename = "static/js/[name].js";
    config.output.chunkFilename = "static/js/[name].chunk.js";
  }

  // CSS sem hash
  config.plugins = config.plugins.map((plugin) => {
    if (plugin instanceof MiniCssExtractPlugin) {
      return new MiniCssExtractPlugin({
        filename: "static/css/[name].css",
        chunkFilename: "static/css/[name].chunk.css",
      });
    }
    return plugin;
  });

  return config;
};
