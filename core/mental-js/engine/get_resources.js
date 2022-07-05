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
  let { resourceSpec, table, dbPayload, primaryKeys, dbOps, directAttributes } =
    gettingStartedPayload({ resourceModels, operation, resource, payload });

  const per_page = parseInt(payload.per_page || resourceSpec.per_page || 10);
  const page = parseInt(payload.page || resourceSpec.per_page || 1);
  const sort = (
    payload.sort ||
    resourceSpec.sort ||
    `${primaryKeys[0]}:desc`
  ).split("*");

  let orderBy = sort.map((s) => {
    let split = s.split(":");
    return { column: split[0], order: split[1], nulls: "first" };
  });

  dbOps.push({
    table: table,
    operation: "get",
    where: {},
    limit: per_page,
    offset: (page - 1) * per_page,
    orderBy,
  });

  let result = await runDbOps(dbOps);

  return { result, payload };
};
