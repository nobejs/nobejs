const Config = require("../config")();
const endpoints = Config.load(Config["endpoints"]);
const responseKey = Config["responseKey"];
const generateApiPath = requireUtil("generateApiPath");
const mental = require("./mental-js/engine");

module.exports = function (app) {
  const mentalRoutes = mental.routes();
  // console.log("mentalRoutes", mentalRoutes);

  mentalRoutes.forEach((mentalRoute) => {
    app[mentalRoute.method](mentalRoute.path, async (req, res, next) => {
      let result = await mental.executeApi(
        mentalRoute.operation,
        mentalRoute.resource,
        {
          req,
          res,
          next,
          reqBody: req.body,
          reqParams: req.params,
          reqQuery: req.query,
          reqHeaders: req.Headers,
        }
      );
      return res.code(200).send(result);
    });
  });

  const apis = endpoints(app);
  apis.forEach((api) => {
    api.endpoints.forEach((endpoint, i) => {
      // console.log("endpoint", endpoint);

      if (endpoint[0] === "crud") {
        let apiPath = generateApiPath(api, endpoint);

        let crudPaths = [
          ["get", "$path", "index"],
          ["post", "$path", "store"],
          ["get", "$path/:uuid", "show"],
          ["put", "$path/:uuid", "update"],
          ["delete", "$path/:uuid", "destroy"],
        ];

        crudPaths.forEach((crudPath) => {
          let finalCrudPath = crudPath[1].replace("$path", apiPath);
          app[crudPath[0]](finalCrudPath, async (req, res, next) => {
            let result = await crudEndpointStrategy(endpoint[2], {
              operation: crudPath[2],
              req,
              res,
              next,
              reqBody: req.body,
              reqParams: req.params,
              reqQuery: req.query,
              reqHeaders: req.Headers,
            });
            return res.code(200).send(result[responseKey]);
          });
        });
      } else {
        let apiPath = generateApiPath(api, endpoint);

        // console.log("endpoint[0]", endpoint[0]);

        app[endpoint[0]](apiPath, async (req, res, next) => {
          let result = await endpointStrategy(endpoint[2], {
            req,
            res,
            next,
            reqBody: req.body,
            reqParams: req.params,
            reqQuery: req.query,
            reqHeaders: req.Headers,
          });
          return res.code(200).send(result[responseKey]);
        });
      }
    });
  });
};
