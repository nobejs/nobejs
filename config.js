if (process.env.ENVFILE) {
  var dotenv = require("dotenv");
  dotenv.config({ path: process.env.ENVFILE });
}

const executeStrategy = require("./core/executeStrategy");

global.endpointStrategy = executeStrategy([
  "authorize",
  "prepare",
  "handle",
  "respond",
]);

global.testStrategy = executeStrategy(["authorize", "handle", "respond"]);

global.requireStory = (name) => require(`./src/stories/${name}/story.js`);
global.requireUtil = (name) => require(`./core/utils/${name}`);
global.requireRepo = (name) => require(`./database/repositories/${name}`);
global.requireHelper = (name) => require(`./src/helpers/${name}`);
global.requireSerializer = (name) => require(`./src/serializers/${name}`);
global.requireValidator = () => require(`./core/validator`);
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
    endpoints: "./src/endpoints",
    excludeFromAuth: ["GET /"],
    responseKey: "respondResult",
  };
};
