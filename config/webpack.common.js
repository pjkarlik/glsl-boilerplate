const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require('path')

module.exports = {
    name: "glsl-boilerplate",
    target: "web",
    entry: {
        main: "./src/index.js",
        vendor: ["@babel/polyfill"],
    },
    output:
    {
        path: path.join(__dirname, "dist/"),
        filename: "[name].js",
        chunkFilename: "[id].js",
        libraryTarget: "umd",
    },
    devtool: 'source-map',
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
      
}
