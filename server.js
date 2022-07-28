const Config = require("./config")();
const httpServer = requireHttpServer();
const path = require("path");
const mentalEngine = require("./core/mental-knexjs-operator/engine");
const mental = require("./core/mental-js/engine/index");

const server = httpServer({});

mental.init({
  resourcesPath: path.resolve(`mental/resources`),
  apiPrefix: "/mental-js",
});

mental.resolvePayload(async (mentalRoute, frameworkData) => {
  return frameworkData.reqBody;
});

mental.resolveUser(async (mentalRoute, frameworkData) => {
  return "*";
});

mental.checkBack(async (mentalAction, event) => {
  // console.log("check back event -- ", mentalAction, event);
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
    return res.code(200).send(result);
  });
});

server.listen(
  { port: process.env.PORT || 3000, host: "0.0.0.0" },
  (err, address) => {
    if (err) {
      console.log(err);
      process.exit(1);
    }
  }
);
