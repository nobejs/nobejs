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

var engine = (function () {
  "use strict";
  const resourceModels = {};
  const customFunctions = {};
  return {
    getResourceModels: () => {
      return resourceModels;
    },
    init: () => {
      const resourcesPath = path.resolve(`mental/resources`);
      let resources = fs.readdirSync(resourcesPath);

      resources.forEach((resource) => {
        const resourcePath = path.resolve(`mental/resources/${resource}`);
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
