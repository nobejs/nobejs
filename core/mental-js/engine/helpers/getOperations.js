const pickKeysFromObject = requireUtil("pickKeysFromObject");
const runTransformation = require("../helpers/runTransformation");

const getOperations = async (context) => {
  const { mentalAction, resourceModels, browserModels, mentalConfig } = context;

  if (mentalAction.browser) {
    const browserSpec = browserModels[mentalAction.browser];
    const attributes = browserSpec.attributes;
    const operations = [];
    let payload = mentalAction.payload;
    let action = mentalAction.action;

    if (action === "browse") {
      const resourceSpec = resourceModels[browserSpec.resources[0]];

      let limitBy = mentalAction.payload.limitBy || { page: 1, per_page: 10 };
      let sortBy = [];

      const resolvedAttributes = attributes;

      const selectColumns = resolvedAttributes.map(
        (m) => `${m.source} as ${m.source}`
      );

      // console.log("mentalAction.filters", mentalAction.filters);

      operations.push({
        resourceSpec: resourceSpec,
        operation: "select",
        filters: mentalAction.filters,
        selectColumns: selectColumns,
        limit: limitBy.per_page,
        page: limitBy.page,
        offset: (limitBy.page - 1) * limitBy.per_page,
        sortBy,
      });
    }

    mentalAction["operations"] = operations;

    context.mentalAction = mentalAction;

    return context;
  }

  if (mentalAction.resource) {
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
      let deleteWhere = pickKeysFromObject(
        payload,
        mentalAction.primaryColumns
      );

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
      let updateWhere = pickKeysFromObject(
        payload,
        mentalAction.primaryColumns
      );

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
  }
};

module.exports = getOperations;
