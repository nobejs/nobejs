const fs = require("fs-extra");
const path = require("path");
// require("../../config");
const knex = requireKnex();
const pickKeysFromObject = requireUtil("pickKeysFromObject");
const baseRepo = requireUtil("baseRepo");
const validator = requireValidator();
const { augmentWithBelongsTo, cleanRequestObject } = require("./helpers");
const createResource = require("./createResource");
const updateResource = require("./updateResource");
const getResource = require("./getResource");
const validate = require("./validate");

const routes = (models, mentalConfig) => {
  const resources = Object.values(models);
  const apiEndpoints = [];
  const mentalApiPrefix =
    mentalConfig.mentalApiPrefix === undefined
      ? "/mental"
      : mentalConfig.mentalApiPrefix;

  console.log("mentalApiPrefix", mentalApiPrefix);

  let crudPaths = [
    {
      method: "post",
      path: "/$api_endpoint/_bulk",
      operation: "create_resources",
    },
    {
      method: "put",
      path: "/$api_endpoint/_bulk",
      operation: "update_resources",
    },
    {
      method: "patch",
      path: "/$api_endpoint/_bulk",
      operation: "patch_resources",
    },
    {
      method: "delete",
      path: "/$api_endpoint/_bulk",
      operation: "delete_resources",
    },
    { method: "get", path: "/$api_endpoint", operation: "get_resources" },
    { method: "get", path: "/$api_endpoint/:uuid", operation: "get_resource" },
    { method: "post", path: "/$api_endpoint", operation: "create_resource" },
    {
      method: "put",
      path: "/$api_endpoint/:uuid",
      operation: "update_resource",
    },
    {
      method: "patch",
      path: "/$api_endpoint/:uuid",
      operation: "patch_resource",
    },
    {
      method: "delete",
      path: "/$api_endpoint/:uuid",
      operation: "delete_resource",
    },
  ];

  for (
    let resourceCounter = 0;
    resourceCounter < resources.length;
    resourceCounter++
  ) {
    const resource = resources[resourceCounter];

    for (
      let crudPathCounter = 0;
      crudPathCounter < crudPaths.length;
      crudPathCounter++
    ) {
      const crudPath = crudPaths[crudPathCounter];

      apiEndpoints.push({
        resource: resource.name,
        method: crudPath.method,
        path:
          mentalApiPrefix +
          crudPath.path.replace(
            "$api_endpoint",
            resource.api_endpoint || resource.name
          ),
        operation: crudPath.operation,
      });
    }
  }

  return apiEndpoints;
};

const execute = async (operation, resource, payload) => {
  console.log("execute ", operation, resource, payload);
};

var engine = (function () {
  "use strict";
  const resourceModels = {};
  const customFunctions = {};
  let mentalConfig = {};
  return {
    getResourceModels: () => {
      return resourceModels;
    },
    routes: () => {
      return routes(resourceModels, mentalConfig);
    },
    init: (config) => {
      mentalConfig = config;
      let resources = fs.readdirSync(config.resourcesPath);
      resources.forEach((resource) => {
        const resourcePath = path.resolve(
          `${config.resourcesPath}/${resource}`
        );
        let resourceData = JSON.parse(fs.readFileSync(resourcePath, "utf-8"));
        if (resourceData.name) {
          resourceModels[resourceData.name] = resourceData;
        }
      });
    },
    executeApi: async function (operation, resource, { req, res, next }) {
      const beforeHookPath = `${mentalConfig.hooksPath}/before_${resource}_${operation}.js`;
      const afterHookPath = `${mentalConfig.hooksPath}/after_${resource}_${operation}.js`;
      let beforeHookResult = {};
      let afterHookResult = {};

      // console.log("executeApi", operation, resource);

      if (fs.existsSync(beforeHookPath)) {
        const beforeHook = require(beforeHookPath);
        beforeHookResult = await beforeHook(req);
      }

      const payload = {};

      await execute(operation, resource, payload);

      if (fs.existsSync(afterHookPath)) {
        const afterHook = require(afterHookPath);
        afterHookResult = await afterHook();
      }

      return {
        operation,
        resource,
      };
    },
    addFunction: function (name, inplaceFunction) {
      customFunctions[name] = inplaceFunction;
    },
  };
})();

module.exports = engine;
