const fs = require('fs');
const path = require('path');
const TerserPlugin = require("terser-webpack-plugin");
const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");

function walk(dir, callback) {
  const files = fs.readdirSync(dir);
  files.forEach(function (file) {
    var filepath = path.join(dir, file);
    const stats = fs.statSync(filepath);
    if (stats.isDirectory()) {
      walk(filepath, callback);
    } else if (stats.isFile()) {
      callback(filepath, stats);
    }
  });
}

const reserved = [];
const reserve = (p) => {
  const name = path.basename(p, path.extname(p));
  reserved.push(name);
};
walk(path.resolve('src/nodes'), reserve);
// walk(path.resolve('src/math'), reserve);

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
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          // ecma: undefined,
          // parse: {},
          // compress: {},
          // mangle: true, // Note `mangle.properties` is `false` by default.
          mangle: {
            // https://github.com/terser/terser#mangle-options
            // eval: false,
            // keep_classnames: false,
            // keep_fnames: false,
            // module: false,
            reserved: reserved,
            // toplevel: false,
            // safari10: false,
            // properties: false
          }
        }
      })
    ]
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
        exclude: /node_modules/,
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