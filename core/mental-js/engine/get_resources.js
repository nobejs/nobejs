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

  // let

  const sort = payload.sort ||
    resourceSpec.sort || [{ attribute: primaryKeys[0], order: "desc" }];

  const selectColumns = directAttributes.map((m) => `${table}.${m}`);

  let orderBy = sort.map((s) => {
    return { column: s.attribute, order: s.order, nulls: "first" };
  });

  console.log("orderBy", orderBy);

  // https://hasura.io/docs/latest/graphql/core/databases/postgres/queries/query-filters/

  let filters = [];

  if (payload.filters !== undefined) {
    filters = payload.filters || [];

    filters = filters.map((f) => {
      return {
        column: f.attribute.toLowerCase(),
        op: f.op,
        value: f.value,
      };
    });
  }

  console.log("filters", filters);
  // Sort filter keys alphabetically
  // Prepare base 64 encode

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
  result = { data: result.data, meta: { page, per_page, total: result.total } };

  return { result, payload };
};
