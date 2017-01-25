const webpack = require('webpack')

module.exports = {
  entry: './client/app/index.js',
  output: {
    filename: 'bundle.js',
    path: './client/dist'
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      enforce: 'pre',
      loader: 'eslint-loader'
    }]
  }
}
