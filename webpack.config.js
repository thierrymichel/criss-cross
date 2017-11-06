module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'lib/index.js',
    library: 'criss-cross',
    libraryTarget: 'umd',
    umdNamedDefine: true,
  },
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
