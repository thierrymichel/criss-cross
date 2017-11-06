const webpack = require('webpack');
const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  entry: './src/index.js',
  output: {
    filename: isProd ? 'dist/criss-cross.min.js' : 'dist/criss-cross.js',
    library: 'crissCross',
    libraryTarget: 'umd',
    umdNamedDefine: true,
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      beautify: false,
      compress: {
        warnings: false,
        drop_console: true, // eslint-disable-line camelcase
      },
      sourceMap: false,
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
    ],
  },
};
