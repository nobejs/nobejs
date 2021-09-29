const fastify = require("fastify");
const Config = require("../config")();
const errorHandler = Config.load(Config["errorHandler"]);
const notFoundHandler = Config.load(Config["notFoundHandler"]);
const authMiddleware = Config.load(Config["authMiddleware"]);
const loadEndpoints = Config.load(Config["loadEndpoints"]);

function build(opts = {}) {
  const app = fastify(opts);
  app.setErrorHandler(errorHandler);
  app.setNotFoundHandler(notFoundHandler);
  app.addHook("onRequest", authMiddleware);
  loadEndpoints(app);
  return app;
}

module.exports = build;
