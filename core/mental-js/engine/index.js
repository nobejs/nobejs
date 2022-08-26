const fs = require("fs-extra");
const path = require("path");
const findKeysFromRequest = requireUtil("findKeysFromRequest");
const generateRoutes = require("./generate_routes");
const createAction = require("./actions/create");
const updateAction = require("./actions/update");
const readAction = require("./actions/read");
const deleteAction = require("./actions/delete");
const browseAction = require("./actions/browse");
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

  if (mentalAction.action === "browse") {
    return await browseAction(context);
  }

  if (mentalAction.action === "crud_config") {
    const { resourceModels } = context;
    const resourceSpec = resourceModels[mentalAction.resource];
    return { respondResult: resourceSpec };
  }

  if (mentalAction.action === "browser_config") {
    const { browserModels } = context;
    const browserSpec = browserModels[mentalAction.browser];
    return { respondResult: browserSpec };
  }

  return { respondResult: mentalAction };
};

var engine = (function () {
  "use strict";
  const resourceModels = {};
  const browserModels = {};
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
      return generateRoutes({ resourceModels, browserModels }, mentalConfig);
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
        browserModels: browserModels,
        mentalConfig: mentalConfig,
        mentalAction: {
          browser: mentalRoute.browser,
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
      let browsers = fs.readdirSync(config.browsersPath);
      resources = resources.filter(
        (e) => path.extname(e).toLowerCase() === ".json"
      );
      mixins = mixins.filter((e) => path.extname(e).toLowerCase() === ".json");
      browsers = browsers.filter(
        (e) => path.extname(e).toLowerCase() === ".json"
      );

      browsers.forEach((browser) => {
        const browserPath = path.resolve(`${config.browsersPath}/${browser}`);
        let browserData = JSON.parse(fs.readFileSync(browserPath, "utf-8"));
        if (browserData.name) {
          let attributesArray = [];

          for (const identifier in browserData.attributes) {
            const attribute = browserData.attributes[identifier];
            attribute["identifier"] = identifier;
            attributesArray.push(attribute);
          }
          browserData.attributes = attributesArray;
          browserModels[browserData.name] = browserData;
        }
      });

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
