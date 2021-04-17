const path = require("path");
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const nodeExternals = require('webpack-node-externals')
/*
 * SplitChunksPlugin is enabled by default and replaced
 * deprecated CommonsChunkPlugin. It automatically identifies modules which
 * should be splitted of chunk by heuristics using module duplication count and
 * module category (i. e. node_modules). And splits the chunks…
 *
 * It is safe to remove "splitChunks" from the generated configuration
 * and was added as an educational example.
 *
 * https://webpack.js.org/plugins/split-chunks-plugin/
 *
 */

module.exports = {
    mode: "production",
    entry: "./src/services/WebService.js",

    target: "node",

    output: {
        path: path.resolve("dist"),
        publicPath: '/',
        filename: 'service.js',
    },

    node: {
        // Need this when working with express, otherwise the build fails
        __dirname: false,   // if you don't put this is, __dirname
        __filename: false,  // and __filename return blank or /
    },

    externals: [
        nodeExternals({
            allowlist: [
                /^core-js/,
                /^@babel/,
                /webpack/,
                /^regenerator-runtime/,
                'body-parser',
                'swagger-ui-express',
                /^fetch/,
            ]
        }),
        {
            fs: "commonjs fs"
        }
    ],

    plugins: [
        new webpack.ProgressPlugin(),
        new CopyWebpackPlugin([
            {
                from: 'src/services/swagger.json',
                to: '.',
            },
            {
                from: 'src/services/Dockerfile',
                to: '.',
            },
            {
                from: 'src/services/package.json',
                to: '.',
            }
        ])
    ],

    // module: {
    //     rules: [
    //         {
    //             test: /.(js)$/,
    //             exclude: /node_modules/,
    //             use: [
    //                 {
    //                     loader: 'babel-loader',
    //                     options: {
    //                         plugins: [
    //                             "add-module-exports",
    //                             [
    //                                 "@babel/plugin-transform-template-literals", {
    //                                 loose: true
    //                             }],
    //                             "@babel/plugin-transform-runtime",
    //                         ],
    //                         presets: [
    //                             ["@babel/preset-env", {
    //                                 modules: false,
    //                                 useBuiltIns: "usage",
    //                                 corejs: 2,
    //                                 targets: {
    //                                     node: "current"
    //                                 }
    //                             }]
    //                         ]
    //                     }
    //                 },
    //             ],
    //         },
    //     ]
    // },

    optimization: {
        minimize: false,
    },

    devtool: "none",
    watchOptions: {
        ignored: /node_modules/
    }
};
