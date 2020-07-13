import { resolve } from 'path';
import glob from 'glob';

const testFiles = glob.sync('test/*.test.js')
  .filter(file => file !== 'test/bundle.test.js')
  .map(file => `./${file}`);

export default {
  entry: testFiles,
  output: {
    path: resolve(__dirname, '../test_dist/'),
    filename: 'bundle.test.js',
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
    ]
  },
  mode: 'none'
};
