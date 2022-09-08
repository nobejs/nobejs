const fs = require("fs-extra");
const path = require("path");
const findKeysFromRequest = requireUtil("findKeysFromRequest");
const generateRoutes = require("./generate_routes");
const executeAction = require("./actions");
const deepAssign = require("./helpers/deepAssign");

var engine = (function () {
  "use strict";
  const resourceModels = {};
  let mentalConfig = {};
  return {
    getResourceModels: () => {
      return resourceModels;
    },
    generateRoutes: () => {
      return generateRoutes({ resourceModels }, mentalConfig);
    },
    resolvePayload: (fn) => {
      resolvePayload = fn;
    },
    executeRoute: async (mentalRoute, frameworkData) => {
      const resolvePayload = require(mentalConfig.resolvePayloadFnPath);
      const resolveUser = require(mentalConfig.resolveUserFnPath);
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
      console.log("init......");

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
  };
})();

module.exports = engine;
