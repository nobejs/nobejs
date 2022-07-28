const mental = require("../core/mental-js/engine/index");
const dbOps = require("./dbOps");
const path = require("path");
const Config = require("../config")();
const responseKey = Config["responseKey"];

module.exports = (server) => {
  mental.init({
    resourcesPath: path.resolve(`mental/resources`),
    apiPrefix: "/mental",
    operator: dbOps,
  });

  mental.resolvePayload(async (mentalRoute, frameworkData) => {
    return frameworkData.reqBody;
  });

  mental.resolveUser(async (mentalRoute, frameworkData) => {
    return "*";
  });

  mental.checkBack(async (mentalAction, event) => {
    return mentalAction;
  });

  mental.addFunction("uniqueForAuthor", async (payload) => {
    console.log("I am custom validator", payload);
    return true;
  });

  const routes = mental.generateRoutes();

  routes.forEach((mentalRoute) => {
    server[mentalRoute.method](mentalRoute.path, async (req, res, next) => {
      let result = await mental.executeRoute(mentalRoute, {
        reqBody: req.body,
        reqParams: req.params,
        reqQuery: req.query,
        reqHeaders: req.Headers,
      });
      return res.code(200).send(result[responseKey]);
    });
  });
};
