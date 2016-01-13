module.exports = {
  entry: ['./app/main.js'],
  output: {
    path: './build',
    filename: 'bundle.js'
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel-loader?presets[]=es2015&presets[]=react' }
    ]
  }
};