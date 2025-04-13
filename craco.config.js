const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Add copy plugin to copy the PDF.js worker file
      webpackConfig.plugins.push(
        new CopyWebpackPlugin({
          patterns: [
            {
              from: path.resolve(__dirname, 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.min.js'),
              to: path.resolve(__dirname, 'public'),
            },
          ],
        })
      );
      return webpackConfig;
    },
  },
}; 