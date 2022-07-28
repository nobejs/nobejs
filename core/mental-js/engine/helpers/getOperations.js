const pickKeysFromObject = requireUtil("pickKeysFromObject");

module.exports = async (mentalAction, resourceSpec) => {
  const operations = [];
  let payload = mentalAction.payload;
  let action = mentalAction.action;

  console.log("payload", payload);

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

  if (action === "read") {
    let limitBy = mentalAction.payload.limitBy || { page: 1, per_page: 1 };
    let filterBy = mentalAction.payload.filterBy || [];
    let sortBy = mentalAction.payload.sortBy || [];
    const table = resourceSpec.meta.table;

    const selectColumns = mentalAction.directColumns.map(
      (m) => `${table}.${m}`
    );

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

  return operations;
};
