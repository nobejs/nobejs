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

  const per_page = parseInt(payload.per_page || resourceSpec.per_page || 10);
  const page = parseInt(payload.page || resourceSpec.per_page || 1);
  const sort_column =
    payload.sort_column || resourceSpec.sort_column || primaryKeys[0];
  const sort_order = payload.sort_order || resourceSpec.sort_order || "desc";

  /**
     * knex('users').orderBy([
  { column: 'email' }, 
  { column: 'age', order: 'desc', nulls: 'first' }
])
     */

  dbOps.push({
    table: table,
    operation: "get",
    where: {},
    limit: per_page,
    offset: (page - 1) * per_page,
    sort_column,
    sort_order,
  });

  let result = await runDbOps(dbOps);

  return { result, payload };
};
