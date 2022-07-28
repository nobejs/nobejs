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

  let getWhere = pickKeysFromObject(dbPayload, primaryKeys);

  dbOps.push({
    table: table,
    operation: "get_first",
    where: getWhere,
  });

  let result = await runDbOps(dbOps);

  console.log("reus", result);

  return { result, dbPayload };
};
