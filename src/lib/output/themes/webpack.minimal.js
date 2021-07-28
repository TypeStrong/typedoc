const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");
// const { InlineAssetsPlugin } = require("./InlineAssetsPlugin");
const { merge } = require("webpack-merge");
const commonConfig = require("./webpack.common");

const config = {
    name: "Minimal Theme",

    output: {
        path: path.resolve(__dirname, "../../../../dist/lib/output/themes/bin/minimal"),
        filename: "assets/js/main.js",
    },

    module: {
        rules: [
            {
                test: /\.png$/,
                loader: "url-loader",
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
