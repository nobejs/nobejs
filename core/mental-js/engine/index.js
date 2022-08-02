const fs = require("fs-extra");
const path = require("path");
const findKeysFromRequest = requireUtil("findKeysFromRequest");
const generateRoutes = require("./generate_routes");
const createAction = require("./actions/create");
const readAction = require("./actions/read");

const executeAction = async (mentalAction, resourceModels, mentalConfig) => {
  console.log("executeAction");

  // const customFunctions = engine.getCustomFunctions();
  // console.log("en", customFunctions);

  // await customFunctions["uniqueForAuthor"].apply(null, [
  //   { resource, action, permissions, payload },
  // ]);

  if (mentalAction.action === "create") {
    return await createAction(mentalAction, resourceModels, mentalConfig);
  }

  if (mentalAction.action === "read") {
    return await createAction(mentalAction, resourceModels, mentalConfig);
  }

  return { respondResult: mentalAction };
};

var engine = (function () {
  "use strict";
  const resourceModels = {};
  let mentalConfig = {};
  let resolvePayload = undefined;
  let resolveUser = undefined;
  let operatorCountAll = undefined;
  const customFunctions = {};
  return {
    operatorCountAll: () => {
      return operatorCountAll;
    },
    getCustomFunctions: () => {
      return customFunctions;
    },
    getResourceModels: () => {
      return resourceModels;
    },
    generateRoutes: () => {
      return generateRoutes(resourceModels, mentalConfig);
    },
    resolvePayload: (fn) => {
      resolvePayload = fn;
    },
    resolveUser: (fn) => {
      resolveUser = fn;
    },

    executeRoute: async (mentalRoute, frameworkData) => {
      const permissions = await resolveUser(mentalRoute, frameworkData);
      const payload = await resolvePayload(mentalRoute, frameworkData);

      let result = await executeAction(
        {
          resource: mentalRoute.resource,
          action: mentalRoute.action,
          permissions,
          payload,
        },
        resourceModels,
        mentalConfig
      );
      return result;
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
    executeAction: async (resource, action, permissions, payload) => {
      return await executeAction(resource, action, permissions, payload);
    },
    addFunction: function (name, inplaceFunction) {
      customFunctions[name] = inplaceFunction;
    },
  };
})();

module.exports = engine;
