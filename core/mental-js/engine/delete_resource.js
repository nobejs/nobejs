const { gettingStartedPayload } = require("./helpers");
const runDbOps = require("./dbOps");
const pickKeysFromObject = requireUtil("pickKeysFromObject");

module.exports = async (
  mentalConfig,
  resourceModels,
  operation,
  resource,
  payload
) => {
  let { resourceSpec, table, dbPayload, primaryKeys, dbOps } =
    gettingStartedPayload({ resourceModels, operation, resource, payload });

  let updateWhere = pickKeysFromObject(dbPayload, primaryKeys);

  if (resourceSpec.soft_delete && resourceSpec.soft_delete === true) {
    dbOps.push({
      table: table,
      operation: "update",
      payload: dbPayload,
      where: updateWhere,
    });
  } else {
    dbOps.push({
      table: table,
      operation: "delete",
      where: updateWhere,
    });
  }

  let result = await runDbOps(dbOps);

  return { result, dbPayload };
};
