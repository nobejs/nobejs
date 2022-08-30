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

  if (action === "delete") {
    let deleteWhere = pickKeysFromObject(payload, mentalAction.primaryColumns);

    if (resourceSpec.softDelete === true) {
      operations.push({
        resourceSpec: resourceSpec,
        operation: "update",
        payload: payload,
        where: deleteWhere,
      });
    } else {
      operations.push({
        resourceSpec: resourceSpec,
        operation: "delete",
        where: deleteWhere,
      });
    }
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
    let limitBy = mentalAction.payload.limitBy || { page: 1, per_page: 10 };
    let filterBy = mentalAction.payload.filterBy || [];
    let sortBy = mentalAction.payload.sortBy || [];
    const table = resourceSpec.meta.table;

    const selectColumns = [
      ...mentalAction.directColumns,
      ...mentalAction.belongsToOneColumns,
    ].map((m) => `${table}.${m}`);

    // console.log("selectColumns", selectColumns);

    filters = filterBy
      .filter((f) => {
        return f.op;
      })
      .map((f) => {
        return {
          column: f.attribute.toLowerCase(),
          op: f.op,
          value: f.value,
        };
      });

    filters = [...filters, ...mentalAction.filters];

    sortBy = sortBy.map((s) => {
      return { column: s.attribute, order: s.order, nulls: "last" };
    });

    operations.push({
      resourceSpec: resourceSpec,
      operation: "select",
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
