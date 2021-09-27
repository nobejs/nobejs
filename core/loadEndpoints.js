const Config = require("../config")();
const endpoints = Config.load(Config["endpoints"]);
const runStory = requireRunStory();
const debugLogger = requireUtil("debugLogger");

module.exports = function (app) {
  const apis = endpoints(app);
  apis.forEach((api) => {
    api.endpoints.forEach((endpoint, i) => {
      let apiPaths = [];
      if (api.apiPrefix !== undefined) {
        apiPaths.push(api.apiPrefix);
      }
      if (endpoint[1] !== "/") {
        apiPaths.push(endpoint[1]);
      }
      apiPaths = apiPaths.map((p) => {
        return p.replace(/^\//, "").replace(/\/$/, "");
      });

      let apiPath = "/" + apiPaths.join("/");

      // debugLogger(`${endpoint[0]} ${apiPath} : ${endpoint[2]}`);

      app[endpoint[0]](apiPath, async (req, res, next) => {
        let result = await runStory(endpoint[2], req, res, next);
        return res.code(200).send(result);
      });
    });
  });
};
