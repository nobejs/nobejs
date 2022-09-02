const fs = require("fs-extra");
const path = require("path");
const findKeysFromRequest = requireUtil("findKeysFromRequest");
const generateRoutes = require("./generate_routes");
const createAction = require("./actions/create");
const updateAction = require("./actions/update");
const readAction = require("./actions/read");
const deleteAction = require("./actions/delete");
const deepAssign = require("./helpers/deepAssign");

const executeAction = async (context) => {
  const { mentalAction } = context;

  // console.log("executeAction", mentalAction);

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

  if (mentalAction.action === "delete") {
    return await deleteAction(context);
  }

  if (mentalAction.action === "crud_config") {
    const { resourceModels } = context;
    const resourceSpec = resourceModels[mentalAction.resource];
    return { respondResult: resourceSpec };
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
      return generateRoutes({ resourceModels }, mentalConfig);
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

      // console.log("payload", payload);

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
      let mixins = fs.readdirSync(config.mixinsPath);
      resources = resources.filter(
        (e) => path.extname(e).toLowerCase() === ".json"
      );
      mixins = mixins.filter((e) => path.extname(e).toLowerCase() === ".json");

      resources.forEach((resource) => {
        const resourcePath = path.resolve(
          `${config.resourcesPath}/${resource}`
        );
        let resourceData = JSON.parse(fs.readFileSync(resourcePath, "utf-8"));
        if (resourceData.name) {
          if (resourceData.mixins && resourceData.mixins.length > 0) {
            for (let index = 0; index < resourceData.mixins.length; index++) {
              let mixin = resourceData.mixins[index];
              if (mixins.includes(mixin)) {
                const mixinPath = path.resolve(`${config.mixinsPath}/${mixin}`);
                let mixinData = JSON.parse(fs.readFileSync(mixinPath, "utf-8"));
                resourceData = deepAssign({})(resourceData, mixinData);
              }
            }
          }

          if (Array.isArray(resourceData.attributes) === false) {
            let attributesArray = [];

            for (const identifier in resourceData.attributes) {
              const attribute = resourceData.attributes[identifier];
              attribute["identifier"] = identifier;
              attribute["resolved_identifier"] = attribute.relation
                ? attribute.relation.resolveTo
                : attribute.identifier;
              attribute["source"] = `${resourceData.meta.table}.${identifier}`;
              attributesArray.push(attribute);
            }
            resourceData.attributes = attributesArray;
          }

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
