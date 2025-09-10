const path = require('path');

module.exports = {
  devServer: {
    setupMiddlewares: (middlewares, devServer) => {
      // This replaces the deprecated onBeforeSetupMiddleware and onAfterSetupMiddleware options
      // Custom middleware logic can be added here if needed
      return middlewares;
    },
  },
  webpack: {
    configure: (webpackConfig) => {
      // Additional webpack configuration if needed
      return webpackConfig;
    },
  },
};