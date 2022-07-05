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
  payload = augmentPayloadWithAutomaticAttributes(
    resourceSpec,
    operation,
    payload
  );
  const primaryKeys = findPrimaryKey(resourceSpec);

  let dbOps = [];

  dbOps.push({
    table: table,
    operation: "create",
    payload: payload,
  });

  let getWhere = pickKeysFromObject(payload, primaryKeys);

  dbOps.push({
    table: table,
    operation: "get",
    where: getWhere,
  });

  let result = await runDbOps(dbOps);

  return { result, payload };
};
