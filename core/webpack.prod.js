const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.common');
const nodeExternals = require('webpack-node-externals');

module.exports = merge(common, {
  mode: 'production',
  externals: [ nodeExternals() ],
  output: {
    clean: true,
  },
  optimization: {
    minimize: true
  }
});