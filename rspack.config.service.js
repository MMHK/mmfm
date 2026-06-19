const path = require('path');
const { CopyRspackPlugin } = require('@rspack/core');

module.exports = {
  mode: 'production',
  entry: './src/services/WebService.js',
  target: 'node',

  output: {
    path: path.resolve('dist'),
    filename: 'service.js'
  },

  node: {
    __dirname: false,
    __filename: false
  },

  externalsPresets: { node: true },
  externals: [
    function({ request }, callback) {
      const allowlist = [/^core-js/, /^@babel/, /webpack/, /^regenerator-runtime/,
                         'body-parser', 'swagger-ui-express', /^fetch/];
      if (allowlist.some(p => p instanceof RegExp ? p.test(request) : p === request)) {
        return callback();
      }
      return callback(null, 'commonjs ' + request);
    }
  ],

  plugins: [
    new CopyRspackPlugin({
      patterns: [
        { from: 'src/services/swagger.json', to: '.' },
        { from: 'src/services/Dockerfile', to: '.' },
        { from: 'src/services/package.json', to: '.' },
        { from: 'src/services/.dockerignore', to: '.' }
      ]
    })
  ],

  optimization: { minimize: false },
  devtool: false
};
