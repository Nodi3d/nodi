const path = require('path');
const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");

module.exports = {
  mode: 'development',
  entry: './index.ts',
  output: {
    // publicPath: 'auto',
    publicPath: '/',
    path: `${__dirname}/dist`,
    filename: 'index.js',
    library: 'nodi',
    libraryTarget: 'umd',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.worker\.ts$/,
        loader: 'worker-loader',
        options: {
          filename: '[name].worker.js',
          publicPath: (pathData, assetInfo) => {
            return '/';
          }
        }
      },
      {
        test: /\.(glsl|vs|fs|vert|frag)$/,
        exclude: /node_modules/,
        use: [
          'raw-loader',
          'glslify-loader'
        ]
      },
      {
        test: /\.ts$/,
        loader: 'ts-loader',
      },
      {
        test: /\.wasm$/,
        exclude: /node_modules/,
        type: "webassembly/async"
      }
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
      '~': path.resolve(__dirname),
    },
    extensions: [
      '.ts', '.js', 'wasm',
    ],
  },
  plugins: [
    new WasmPackPlugin({
      crateDirectory: path.join(__dirname, './wasm/marching-cubes')
    })
  ],
  stats: {
    children: true
  },
  experiments: {
    asyncWebAssembly: true
  }
};