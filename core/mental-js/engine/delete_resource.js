const {
  augmentWithBelongsTo,
  augmentWithManyToMany,
  findPrimaryKey,
  getColumnsFromAttributes,
  getAutomaticAttributes,
  augmentPayloadWithAutomaticAttributes,
  getAttributes,
} = require("./helpers");
const runDbOps = require("./dbOps");
const pickKeysFromObject = requireUtil("pickKeysFromObject");

module.exports = async (
  mentalConfig,
  resourceModels,
  operation,
  resource,
  payload
) => {
  let resourceSpec = resourceModels[resource];
  let table = resourceSpec["sql_table"];
  let dbPayload = {};
  let augmentedPayload = augmentPayloadWithAutomaticAttributes(
    resourceSpec,
    operation,
    payload
  );
  dbPayload = augmentedPayload;
  const primaryKeys = findPrimaryKey(resourceSpec);

  let dbOps = [];

  let updateWhere = pickKeysFromObject(dbPayload, primaryKeys);

  dbOps.push({
    table: table,
    operation: "delete",
    where: updateWhere,
  });

  let result = await runDbOps(dbOps);

  return { result, dbPayload };
};
