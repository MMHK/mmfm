require('dotenv').config();
const rspack = require('@rspack/core');
const path = require('path');
const { VueLoaderPlugin } = require('rspack-vue-loader');

const IS_DEV = process.env.NODE_ENV === 'development';

module.exports = {
  entry: './src/main.ts',

  output: {
    filename: 'static/js/[name].[contenthash:8].js',
    path: path.resolve(__dirname, 'dist/public'),
    clean: true,
    assetModuleFilename: 'static/assets/[name].[contenthash:8][ext]'
  },

  resolve: {
    extensions: ['.ts', '.js', '.vue', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },

  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'rspack-vue-loader',
        options: { experimentalInlineMatchResource: true }
      },
      {
        test: /\.[jt]s$/,
        use: [{
          loader: 'builtin:swc-loader',
          options: {
            jsc: { parser: { syntax: 'typescript' } }
          }
        }],
        type: 'javascript/auto'
      },
      {
        test: /\.css$/,
        type: 'css'
      },
      {
        test: /\.scss$/,
        type: 'css',
        use: ['sass-loader']
      },
      {
        test: /\.(png|jpe?g|gif|svg|ico)$/i,
        type: 'asset/resource',
        generator: { filename: 'static/img/[name].[hash:8][ext]' }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: { filename: 'static/fonts/[name].[hash:8][ext]' }
      }
    ]
  },

  plugins: [
    new VueLoaderPlugin(),
    new rspack.HtmlRspackPlugin({
      template: './public/index.html',
      filename: 'index.html'
    }),
    new rspack.DefinePlugin({
      'process.env.LOCAL_PLAYER_MODE': JSON.stringify(process.env.LOCAL_PLAYER_MODE || 'false')
    })
  ],

  optimization: {
    splitChunks: false,
    minimize: !IS_DEV
  },

  experiments: {
    css: true
  },

  devServer: {
    port: 8080,
    hot: true,
    proxy: [
      { context: ['/api'], target: 'http://127.0.0.1:8011', changeOrigin: true },
      { context: ['/io'], target: 'http://127.0.0.1:8011', changeOrigin: true, ws: true },
      { context: ['/song'], target: 'http://127.0.0.1:8011', changeOrigin: true },
      { context: ['/youtube'], target: 'http://127.0.0.1:8011', changeOrigin: true },
      { context: ['/cache'], target: 'http://127.0.0.1:8011', changeOrigin: true }
    ]
  },

  devtool: IS_DEV ? 'source-map' : false
};
