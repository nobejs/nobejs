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
const customFunctions = {};

// mental.createResource("type",data);
// mental.updateResource("type", identifier, data)
// mental.deleteResource("type",identifier)
// mental.getResources("type",query)
// mental.getResource("type",query)

const addFunction = (name, validator) => {
  customFunctions[name] = validator;
};

const init = () => {
  const resourcesPath = path.resolve(`mental/resources`);
  let resources = fs.readdirSync(resourcesPath);

  resources.forEach((resource) => {
    const resourcePath = path.resolve(`mental/resources/${resource}`);
    let resourceData = JSON.parse(fs.readFileSync(resourcePath, "utf-8"));

    if (resourceData.name) {
      resourceModels[resourceData.name] = resourceData;
    }
  });
};

const routes = (models) => {
  const resources = Object.keys(models);
  const apiEndpoints = [];

  let crudPaths = [
    { method: "get", path: "/$resources", operation: "get_resources" },
    { method: "post", path: "/$resources", operation: "create_resource" },
    { method: "get", path: "/$resources/:uuid", operation: "get_resource" },
    { method: "put", path: "/$resources/:uuid", operation: "update_resource" },
    {
      method: "patch",
      path: "/$resources/:uuid",
      operation: "patch_resource",
    },
    {
      method: "delete",
      path: "/$resources/:uuid",
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
        resource: resource,
        method: crudPath.method,
        path: crudPath.path.replace("$resource", resource),
        operation: crudPath.operation.replace("$resource", resource),
      });
    }
  }

  return apiEndpoints;
};

var engine = (function () {
  "use strict";
  const resourceModels = {};
  const customFunctions = {};
  return {
    getResourceModels: () => {
      return resourceModels;
    },
    routes: () => {
      return routes(resourceModels);
    },
    init: (resourcesPath) => {
      let resources = fs.readdirSync(resourcesPath);
      resources.forEach((resource) => {
        const resourcePath = path.resolve(`${resourcesPath}/${resource}`);
        let resourceData = JSON.parse(fs.readFileSync(resourcePath, "utf-8"));

        if (resourceData.name) {
          resourceModels[resourceData.name] = resourceData;
        }
      });
    },
    addFunction: function (name, inplaceFunction) {
      customFunctions[name] = inplaceFunction;
    },
  };
})();

module.exports = engine;
