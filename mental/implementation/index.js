const fs = require("fs-extra");
const path = require("path");
// require("../../config");
const knex = requireKnex();
const pickKeysFromObject = requireUtil("pickKeysFromObject");
const baseRepo = requireUtil("baseRepo");
const validator = requireValidator();
// const { augmentWithBelongsTo, cleanRequestObject } = require("./helpers");
// const createResource = require("./createResource");
// const updateResource = require("./updateResource");
// const getResource = require("./getResource");
// const validate = require("./validate");
const mentalEngine = require("../engine");

// mental.createResource("type",data);
// mental.updateResource("type", identifier, data)
// mental.deleteResource("type",identifier)
// mental.getResources("type",query)
// mental.getResource("type",query)

const executeViaApi = async (operation, resource, { req, res, next }) => {
  try {
    const payload = cleanRequestObject(resourceModels, resource, req);

    if (["create_resource", "update_resource"].includes(operation)) {
      await validate(resourceModels, resource, payload);
    }

    let result;

    switch (operation) {
      case "create_resource":
        result = await createResource(resourceModels, resource, payload);
        break;

      case "update_resource":
        result = await updateResource(
          resourceModels,
          resourceModels[resource],
          payload
        );

        break;

      case "get_resource":
        result = await getResource(
          resourceModels,
          resourceModels[resource],
          payload
        );

        break;

      default:
        break;
    }

    return {
      result,
      payload,
      operation,
      resource,
    };
  } catch (error) {
    throw error;
  }
};

const routes = () => {
  const resources = Object.keys(mentalEngine.getResourceModels());
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

      // console.log("resource", resource, crudPath);
    }
  }

  // console.log("apiEndpoints", apiEndpoints);

  return apiEndpoints;
};

module.exports = {
  executeViaApi,
  routes,
};
