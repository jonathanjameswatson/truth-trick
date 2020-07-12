import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ExtractCssChunks from 'extract-css-chunks-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import FriendlyErrorsWebpackPlugin from 'friendly-errors-webpack-plugin';
import { HashedModuleIdsPlugin } from 'webpack';
import WebpackCleanupPlugin from 'webpack-cleanup-plugin';
import SpriteLoaderPlugin from 'svg-sprite-loader/plugin';
import FaviconsWebpackPlugin from 'favicons-webpack-plugin';
import WorkboxWebpackPlugin from 'workbox-webpack-plugin';

export default {
  entry: './src/js/main.mjs',
  output: {
    path: path.resolve(__dirname, 'dist/'),
    publicPath: '/truth-trick/',
    filename: '[name].[hash].mjs',
    chunkFilename: '[name].[chunkhash].chunk.mjs',
  },
  devServer: {
    contentBase: './dist',
    openPage: '/truth-trick',
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            ecma: 5,
            warnings: false,
            comparisons: false,
            inline: 2,
          },
          parse: {
            ecma: 8,
          },
          mangle: { safari10: true },
          output: {
            ecma: 5,
            safari10: true,
            comments: false,
            /* eslint-disable-next-line camelcase */
            ascii_only: true,
          },
        },
        parallel: true,
        sourceMap: false,
        cache: true,
      }),
    ],
    splitChunks: {
      chunks: 'all',
      minSize: 30000,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      name: true,
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'all',
        },
        main: {
          chunks: 'all',
          minChunks: 2,
          reuseExistingChunk: true,
          enforce: true,
        },
      },
    },
    runtimeChunk: true,
  },
  module: {
    rules: [
      {
        test: /\.mjs$/,
        exclude: /node_modules/,
        use: [
          'babel-loader?cacheDirectory=true',
        ],
      },
      {
        test: /\.css$/,
        use: [
          ExtractCssChunks.loader,
          'css-loader',
          'clean-css-loader',
        ],
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: 'svg-sprite-loader',
            options: {
              extract: true,
            },
          },
          'svg-transform-loader',
          'svgo-loader',
        ],
      },
      {
        test: /\.(woff2|woff)$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'fonts/',
          },
        }],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        removeScriptTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
    }),
    new ExtractCssChunks(
      {
        filename: '[name].css',
        chunkFilename: '[id].css',
      },
    ),
    new HashedModuleIdsPlugin({
      hashFunction: 'sha256',
      hashDigest: 'hex',
      hashDigestLength: 20,
    }),
    new FriendlyErrorsWebpackPlugin(),
    new WebpackCleanupPlugin(),
    new SpriteLoaderPlugin(),
    new FaviconsWebpackPlugin({
      logo: './logo.png',
      favicons: {
        appName: 'Truth Trick',
        appDescription: 'A boolean expression visualiser',
        start_url: '/truth-trick/',
      },
    }),
    new WorkboxWebpackPlugin.GenerateSW({
      clientsClaim: true,
      skipWaiting: true,
    }),
  ],
};
