// Inside vue.config.js
//const {GenerateSW} = require('workbox-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    chainWebpack: config => {
        config.optimization.delete('splitChunks');
    },
    outputDir: __dirname + "/dist/public",
    // productionSourceMap: true,
    css: {
        loaderOptions: {
            postcss: {
                sourceMap: process.env.NODE_ENV === 'production' ? false : true
            },
            css: {
                sourceMap: process.env.NODE_ENV === 'production' ? false : true
            },
            sass: {
                sourceMap: process.env.NODE_ENV === 'production' ? false : true
            }
        }
    },
    devServer: {
        proxy: {
            "/api" : {
                target: "http://127.0.0.1:8011"
            },
            "/io" : {
                target: "http://127.0.0.1:8011"
            },
            "/song" : {
                target: "http://127.0.0.1:8011"
            },
            "/cache" : {
                target: "http://127.0.0.1:8011"
            }
        }
    }
}