const fs = require("fs-extra");
const path = require("path");
// require("../../config");
const knex = requireKnex();
const pickKeysFromObject = requireUtil("pickKeysFromObject");
const baseRepo = requireUtil("baseRepo");

const customFunctions = {};
const resourceModels = {};

// mental.createPosts

// mental.createResource("type",data);
// mental.updateResource("type", identifier, data)
// mental.deleteResource("type",identifier)
// mental.getResources("type",query)
// mental.getResource("type",query)

const createResource = async (type, payload) => {
  // This method should take structure from json doc
  // It should validate the data
  // It should also make sense of relationships
  // We can handle following relationships
  // one_one - table_which_maintains_this_relationship, column
  // one_many - user has many addresses
  // - addresses table
  // - current resource id
  // many_many
  // - pivot table
  // columns
};

const run = async () => {
  const resourcesPath = path.resolve(`mental/resources`);

  let resources = fs.readdirSync(resourcesPath);

  let resourceModels = {};

  const request = {
    title: "Hello World",
    body: "Hey",
  };

  resources.forEach((resource) => {
    const resourcePath = path.resolve(`mental/resources/${resource}`);
    let resourceData = JSON.parse(fs.readFileSync(resourcePath, "utf-8"));

    if (resourceData.name) {
      resourceModels[resourceData.name] = resourceData;
    }
  });

  // Get posts directly

  let columns = resourceModels["posts"]["attributes"];
  columns = columns
    .filter((c) => {
      return c.type !== "relation";
    })
    .map((c) => {
      //   return `${resourceModels["posts"]["sql_table"]}.${c.name}`;
      return `${c.name}`;
    });

  const payload = pickKeysFromObject(request, columns);

  console.log("customFunctions", customFunctions);

  customFunctions["uniqueForAuthor"](payload);

  // Create Post

  // const post = await baseRepo.create(
  //   resourceModels["posts"]["sql_table"],
  //   payload
  // );

  // console.log("called engine", post);
};

const addFunction = (name, validator) => {
  customFunctions[name] = validator;
};

const executeViaApi = async (operation, resource, { req, res, next }) => {
  return {
    operation,
    resource,
  };
};

const routes = () => {
  const resources = Object.keys(resourceModels);
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

module.exports = {
  init,
  executeViaApi,
  routes,
  run,
  addFunction,
};
