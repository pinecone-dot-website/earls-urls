const path = require('path');

module.exports = (env) => ({
  entry: path.resolve(__dirname, './src/index.js'),
  mode: env.mode || "production",
  module: {
    rules: [{
      test: /\.(jsx|js)$/,
      include: path.resolve(__dirname, 'src'),
      exclude: /node_modules/,
      use: [{
        loader: 'babel-loader',
        options: {
          presets: [
            ['@babel/preset-env', {
              "targets": "defaults"
            }],
            '@babel/preset-react'
          ]
        }
      }]
    }]
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, './public/js'),
  },
  watch: env.mode === 'development',
});