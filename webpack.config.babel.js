import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import SpriteLoaderPlugin from 'svg-sprite-loader/plugin';
import FaviconsWebpackPlugin from 'favicons-webpack-plugin';
import WorkboxWebpackPlugin from 'workbox-webpack-plugin';

export default {
  entry: './src/js/index.mjs',
  mode: process.env.WEBPACK_SERVE ? 'development' : 'production',
  devtool: process.env.WEBPACK_SERVE ? 'eval-cheap-source-map' : false,
  resolve: {
    extensions: ['.js', '.mjs'],
  },
  output: {
    filename: '[name].[contenthash].mjs',
    publicPath: '/truth-trick/',
    chunkFilename: '[name].[chunkhash].chunk.mjs',
    clean: true,
  },
  devServer: {
    hot: true,
    open: ['/truth-trick/index.html'],
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
      }),
    ],
    runtimeChunk: true,
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
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
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts/',
            },
          },
        ],
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
    new MiniCssExtractPlugin(),
    new SpriteLoaderPlugin(),
    new FaviconsWebpackPlugin({
      logo: './logo.png',
      favicons: {
        appName: 'Truth Trick',
        appDescription: 'A boolean expression visualiser',
        start_url: '/truth-trick/',
      },
    }),
    ...(process.env.WEBPACK_SERVE
      ? []
      : [
          new WorkboxWebpackPlugin.GenerateSW({
            clientsClaim: true,
            skipWaiting: true,
            maximumFileSizeToCacheInBytes: 6000000,
          }),
        ]),
  ],
};
