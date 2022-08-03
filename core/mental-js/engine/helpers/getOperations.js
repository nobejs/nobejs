const pickKeysFromObject = requireUtil("pickKeysFromObject");

const getOperations = async (context) => {
  const { mentalAction, resourceModels, mentalConfig } = context;
  const resourceSpec = resourceModels[mentalAction.resource];
  const attributes = resourceSpec.attributes;

  const operations = [];
  let payload = mentalAction.payload;
  let action = mentalAction.action;

  if (action === "create") {
    operations.push({
      resourceSpec: resourceSpec,
      operation: "insert",
      payload: payload,
    });

    let getWhere = pickKeysFromObject(payload, mentalAction.primaryColumns);

    operations.push({
      resourceSpec: resourceSpec,
      operation: "select_first",
      where: getWhere,
    });
  }

  if (action === "update") {
    let updateWhere = pickKeysFromObject(payload, mentalAction.primaryColumns);

    operations.push({
      resourceSpec: resourceSpec,
      operation: "update",
      payload: payload,
      where: updateWhere,
    });

    operations.push({
      resourceSpec: resourceSpec,
      operation: "select_first",
      where: updateWhere,
    });
  }

  if (action === "read") {
    let limitBy = mentalAction.payload.limitBy || { page: 1, per_page: 1 };
    let filterBy = mentalAction.payload.filterBy || [];
    let sortBy = mentalAction.payload.sortBy || [];
    const table = resourceSpec.meta.table;

    const selectColumns = [
      ...mentalAction.directColumns,
      ...mentalAction.belongsToOneColumns,
    ].map((m) => `${table}.${m}`);

    filters = filterBy.map((f) => {
      return {
        column: f.attribute.toLowerCase(),
        op: f.op,
        value: f.value,
      };
    });

    sortBy = sortBy.map((s) => {
      return { column: s.attribute, order: s.order, nulls: "last" };
    });

    operations.push({
      resourceSpec: resourceSpec,
      operation: "get",
      filters: filters,
      selectColumns: selectColumns,
      limit: limitBy.per_page,
      offset: (limitBy.page - 1) * limitBy.per_page,
      sortBy,
    });
  }

  mentalAction["operations"] = operations;

  context.mentalAction = mentalAction;

  return context;
};

module.exports = getOperations;
