const fs = require("fs-extra");
const path = require("path");
const findKeysFromRequest = requireUtil("findKeysFromRequest");
const generateRoutes = require("./generate_routes");
const createAction = require("./actions/create");
const updateAction = require("./actions/update");
const readAction = require("./actions/read");

const executeAction = async (context) => {
  const { mentalAction } = context;

  console.log("executeAction");

  // const customFunctions = engine.getCustomFunctions();
  // console.log("en", customFunctions);

  // await customFunctions["uniqueForAuthor"].apply(null, [
  //   { resource, action, permissions, payload },
  // ]);

  if (mentalAction.action === "create") {
    return await createAction(context);
  }

  if (mentalAction.action === "update") {
    return await updateAction(context);
  }

  if (mentalAction.action === "read") {
    return await readAction(context);
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

      let result = await executeAction({
        resourceModels: resourceModels,
        mentalConfig: mentalConfig,
        mentalAction: {
          resource: mentalRoute.resource,
          action: mentalRoute.action,
          permissions,
          payload,
        },
      });
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
