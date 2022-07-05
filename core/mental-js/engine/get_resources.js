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

  const selectColumns = directAttributes.map((m) => `${table}.${m}`);

  let orderBy = sort.map((s) => {
    let split = s.split(":");
    return { column: split[0], order: split[1], nulls: "first" };
  });

  // https://hasura.io/docs/latest/graphql/core/databases/postgres/queries/query-filters/

  let filters = [];

  if (payload.filters !== undefined) {
    filters = (payload.filters || ``).split("*");

    filters = filters
      .filter((f) => {
        return f !== "";
      })
      .map((f) => {
        let split = f.split("$");
        return {
          column: split[0].toLowerCase(),
          op: split[1],
          value: split[2],
        };
      });
  }

  console.log("filters", filters);

  dbOps.push({
    table: table,
    operation: "get",
    filters: filters,
    selectColumns: selectColumns,
    limit: per_page,
    offset: (page - 1) * per_page,
    orderBy,
  });

  let result = await runDbOps(dbOps);

  return { result, payload };
};
