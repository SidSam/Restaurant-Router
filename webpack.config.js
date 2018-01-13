var path = require("path")
var webpack = require('webpack')
var BundleTracker = require('webpack-bundle-tracker')

module.exports = {
  context: __dirname,

  entry: {
    landingPage: './routeyourfood/static/routeyourfood/js/landingpage',
    indexPage: './routeyourfood/static/routeyourfood/js/index'
  }, 

  devtool: 'inline-source-map',

  output: {
      path: path.resolve('./routeyourfood/static/routeyourfood/bundles/'),
      filename: "[name].js",
  },

  plugins: [
    new BundleTracker({filename: './webpack-stats.json'}),
  ],

  module: {
    loaders: [
      { 
        test: /\.jsx?$/, 
        exclude: /node_modules/, 
        loader: 'babel-loader',
        query: {
          presets: ['react']
        },
      }, // to transform JSX into JS
      { 
          test: /\.css$/, 
          loader: 'css-loader' 
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        loader: 'file-loader'
      }
    ],
  },

  resolve: {
    modules: ['node_modules', 'bower_components'],
    extensions: ['.js', '.jsx']
  },
}