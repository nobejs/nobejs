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
const mentalEngine = require("../../mental-nodejs/engine");

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

module.exports = {
  executeViaApi,
};
