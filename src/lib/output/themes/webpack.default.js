const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { merge } = require("webpack-merge");
const commonConfig = require("./webpack.common");

const config = {
    name: "Default Theme",

    output: {
        path: path.resolve(__dirname, "bin", "default"),
        filename: "assets/js/main.js",
    },

    module: {
        rules: [
            {
                test: /\.png$/,
                loader: "file-loader",
                options: {
                    outputPath: "assets/images",
                    publicPath: "../images",
                    name: "[name].[ext]",
                },
            },
        ],
    },

    plugins: [
        new MiniCssExtractPlugin({
            filename: "assets/css/main.css",
        })
    ],
};

module.exports = merge(commonConfig, config);
