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

  dbOps.push({
    table: table,
    operation: "update",
    payload: dbPayload,
    where: updateWhere,
  });

  let result = await runDbOps(dbOps);

  return { result, dbPayload };
};
