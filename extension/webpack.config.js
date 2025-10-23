const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env) => {
  const target = env.target || 'chrome';
  const isSafari = target === 'safari';
  const outputDir = isSafari ? 'dist-safari' : 'dist';
  const manifestFile = isSafari ? 'manifest.safari.json' : 'manifest.json';

  return {
    entry: {
      'background/service-worker': './background/service-worker.ts',
      'content/content-script': './content/content-script.ts',
      'popup/popup': './popup/popup.tsx',
      'options/options': './options/options.tsx',
    },
    output: {
      path: path.resolve(__dirname, outputDir),
      filename: '[name].js',
      clean: true,
    },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
    plugins: [
      new CopyPlugin({
        patterns: [
          { from: manifestFile, to: 'manifest.json' },
          { from: 'public', to: 'public' },
          { from: 'content/content-styles.css', to: 'content/content-styles.css' },
        ],
      }),
      new HtmlWebpackPlugin({
        template: './popup/popup.html',
        filename: 'popup/popup.html',
        chunks: ['popup/popup'],
      }),
      new HtmlWebpackPlugin({
        template: './options/options.html',
        filename: 'options/options.html',
        chunks: ['options/options'],
      }),
    ],
  };
};

