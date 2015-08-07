var path = require("path");

module.exports = {
  entry: "./src/pagination.js",
  output: {
    filename: "pagination.min.js"
  },
  resolve: {
    fallback: path.join(__dirname, "helpers")
  },
	module: {
		loaders: [{ test: /\.handlebars$/, loader: "handlebars-loader" }]
	}
};
