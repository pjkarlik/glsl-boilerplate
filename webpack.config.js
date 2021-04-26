/* eslint no-console: 0 */

"use strict";
const fs = require("fs");
const pkgInfo = require("./package.json");
const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ip = require('internal-ip');

const DEV_PORT = 2020;
const { name, version, description, repository } = pkgInfo;
const { url } = repository;

const infoColor = (_message) =>
{
  return `\u001b[1m\u001b[34m${_message}\u001b[39m\u001b[22m`;
};

fs.writeFileSync(
  "version.json",
  JSON.stringify({ name, version, description, url })
);

const config = {
  name: "glsl-boilerplate",
  target: "web",
  entry: {
    main: "./src/index.js",
    vendor: ["@babel/polyfill"],
  },
  mode: 'development',
  output:
    {
      path: path.join(__dirname, "./dist/"),
      filename: "[name].js",
      chunkFilename: "[id].js",
      libraryTarget: "umd",
    },
  devtool: 'source-map',
  devServer:
  {
    host: '0.0.0.0',
    port: DEV_PORT,
    contentBase: './dist',
    watchContentBase: true,
    open: true,
    https: false,
    useLocalIp: true,
    disableHostCheck: true,
    overlay: true,
    noInfo: true,
    after: function(app, server, compiler)
    {
      const port = server.options.port;
      const https = server.options.https ? 's' : '';
      const localIp = ip.v4.sync();
      const domain1 = `http${https}://${localIp}:${port}`;
      const domain2 = `http${https}://localhost:${port}`;
          
      console.log(`Project running at:\n  - ${infoColor(domain1)}\n  - ${infoColor(domain2)}`);
    }
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        include: [/src/, /resources/],
        use: [
          {
            loader: "babel-loader",
            options: {
              cacheDirectory: true,
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|gif|cur|jpg)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "images/[name]__[hash:base64:5].[ext]",
            },
          },
          {
            loader: "image-webpack-loader",
            options: {
              bypassOnDebug: true,
              optipng: {
                optimizationLevel: 7,
              },
              gifsicle: {
                interlaced: false,
              },
            },
          },
        ],
      },
    ],
  },
  plugins:
  [
    new MiniCssExtractPlugin(),
    new HtmlWebpackPlugin({
      css: "style/style.css",
      title: "WebGL Fragment Shader | Pjkarlik",
      favicon: "./resources/images/favicon.ico",
      template: "./resources/templates/template.ejs",
      inject: "body",
    }),
  ],
};

module.exports = config;
