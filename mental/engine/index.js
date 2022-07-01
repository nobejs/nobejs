const fs = require("fs-extra");
const path = require("path");
// require("../../config");
const knex = requireKnex();
const pickKeysFromObject = requireUtil("pickKeysFromObject");
const findKeysFromRequest = requireUtil("findKeysFromRequest");
const baseRepo = requireUtil("baseRepo");
const validator = requireValidator();

const customFunctions = {};
const resourceModels = {};

// mental.createResource("type",data);
// mental.updateResource("type", identifier, data)
// mental.deleteResource("type",identifier)
// mental.getResources("type",query)
// mental.getResource("type",query)

const createResource = async (resourceSpec, payload) => {
  let attributes = resourceSpec["attributes"];
  let table = resourceSpec["sql_table"];

  let columns = attributes
    .filter((c) => {
      return c.type !== "relation";
    })
    .map((c) => {
      return `${c.name}`;
    });

  let relations = attributes.filter((c) => {
    return c.type === "relation";
  });

  const dbRecord = pickKeysFromObject(payload, columns);

  let result = await knex.transaction(async (trx) => {
    const rows = await trx(table).insert(dbRecord).returning("*");
    let mainResource = rows[0];

    for (
      let relationIndex = 0;
      relationIndex < relations.length;
      relationIndex++
    ) {
      const relation = relations[relationIndex];
      const dbRelationRecord = {};
      dbRelationRecord[relation["current_matching_column"]] =
        payload[relation.name];
      payload["updated_at"] = new Date().toISOString();
      await trx(table)
        .where({
          uuid: mainResource.uuid,
        })
        .whereNull("deleted_at")
        .update(dbRelationRecord)
        .returning("*");
    }

    mainResource = await trx(table)
      .where({
        uuid: mainResource.uuid,
      })
      .whereNull("deleted_at")
      .first();

    return mainResource;
  });

  return result;

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

const addFunction = (name, validator) => {
  customFunctions[name] = validator;
};

const validate = async (attributes, payload) => {
  const constraints = {};

  for (let aCounter = 0; aCounter < attributes.length; aCounter++) {
    const attribute = attributes[aCounter];
    if (attribute.validators && attribute.validators.length) {
      constraints[attribute.name] = {};
      for (
        let vCounter = 0;
        vCounter < attribute.validators.length;
        vCounter++
      ) {
        const validatorType = attribute.validators[vCounter];
        if (validatorType === "required") {
          constraints[attribute.name]["presence"] = {
            allowEmpty: false,
            message: `^Please enter ${attribute.name}`,
          };
        }
      }
    }
  }

  console.log("constraints", constraints);

  return validator(payload, constraints);
};

const executeViaApi = async (operation, resource, { req, res, next }) => {
  try {
    let attributes = resourceModels[resource]["attributes"];
    let columns = attributes.map((c) => {
      return `${c.name}`;
    });

    const payload = findKeysFromRequest(req, columns);

    await validate(attributes, payload);

    let result;

    switch (operation) {
      case "create_resource":
        result = await createResource(resourceModels[resource], payload);
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
  addFunction,
};
