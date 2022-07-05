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

  dbOps.push({
    table: table,
    operation: "create",
    payload: dbPayload,
  });

  let getWhere = pickKeysFromObject(dbPayload, primaryKeys);

  dbOps.push({
    table: table,
    operation: "get",
    where: getWhere,
  });

  let result = await runDbOps(dbOps);

  return { result, dbPayload };
};
