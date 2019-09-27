// Inside vue.config.js
//const {GenerateSW} = require('workbox-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    chainWebpack: config => {
        config.optimization.delete('splitChunks');
    },
    configureWebpack: (config) => {
        if (process.env.NODE_ENV === 'production') {
            return {
                plugins: [
                    new CopyWebpackPlugin([
                        {
                            from: 'src/services/WebService.js',
                            to: '../service.js',
                        },
                        {
                            from: 'src/services/package.json',
                            to: '../',
                        },
                        {
                            from: 'src/services/swagger.json',
                            to: '../',
                        },
                        {
                            from: 'src/services/Dockerfile',
                            to: '../',
                        }
                    ])
                ]
            }
        }

        return {};
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
                target: "http://192.168.33.6:8888"
            },
            "/io" : {
                target: "http://192.168.33.6:8888"
            },
            "/song" : {
                target: "http://192.168.33.6:8888"
            }
        }
    }
}