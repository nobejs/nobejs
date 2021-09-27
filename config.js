if (process.env.ENVFILE) {
  var dotenv = require("dotenv");
  dotenv.config({ path: process.env.ENVFILE });
}

global.requireStory = (name) => require(`./src/stories/${name}/handler.js`);
global.requireUtil = (name) => require(`./core/utils/${name}`);
global.requireRepo = (name) => require(`./database/repositories/${name}`);
global.requireHelper = (name) => require(`./src/helpers/${name}`);
global.requireSerializer = (name) => require(`./src/serializers/${name}`);
global.requireValidator = () => require(`./core/validator`);
global.requireTestStory = () => require(`./core/testStory`);
global.requireRunStory = () => require(`./core/runStory`);
global.requireHttpServer = () => require(`./core/httpServer`);

module.exports = () => {
  return {
    load: (file) => {
      return require(file);
    },
    httpServer: "./core/httpServer",
    errorHandler: "./core/errorHandler",
    notFoundHandler: "./core/notFoundHandler",
    authMiddleware: "./core/authMiddleware",
    loadEndpoints: "./core/loadEndpoints",
    validator: "./core/validator",
    runStory: "./core/runStory",
    testStory: "./core/testStory",
    endpoints: "./src/endpoints",
    endpoints: "./src/endpoints",
    excludeFromAuth: ["GET /liveness"],
  };
};
