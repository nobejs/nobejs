const pickKeysFromObject = requireUtil("pickKeysFromObject");

const getOperations = async (context) => {
  const { mentalAction, resourceModels, mentalConfig } = context;

  const resourceSpec = resourceModels[mentalAction.resource];
  const attributes = resourceSpec.attributes;

  const operations = [];
  let payload = mentalAction.payload;
  let hasManyPayload = mentalAction.hasManyPayload;
  let action = mentalAction.action;

  if (action === "create") {
    // console.log("payload", payload);

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

    if (resourceSpec.softDelete === false) {
      operations.push({
        resourceSpec: resourceSpec,
        operation: "delete",
        where: deleteWhere,
      });
    } else {
      operations.push({
        resourceSpec: resourceSpec,
        operation: "update",
        payload: payload,
        where: deleteWhere,
      });
    }
  }

  if (action === "update" || action === "patch") {
    let updateWhere = pickKeysFromObject(payload, mentalAction.primaryColumns);

    operations.push({
      resourceSpec: resourceSpec,
      operation: "update",
      payload: payload,
      where: updateWhere,
    });

    // We have to run an insert query insert for has many via pivot relationships

    // console.log(
    //   "mentalAction.hasManyViaPivotColumns",
    //   mentalAction.hasManyViaPivotColumns
    // );

    const hasManyViaPivotColumns = mentalAction.hasManyViaPivotColumns;

    for (let index = 0; index < hasManyViaPivotColumns.length; index++) {
      const hasManyViaPivotColumn = hasManyViaPivotColumns[index];
      if (hasManyPayload[hasManyViaPivotColumn] !== undefined) {
        const attributeSpec = attributes.find((element) => {
          return element.identifier === hasManyViaPivotColumn;
        });
        const resourcePayload = hasManyPayload[hasManyViaPivotColumn];
        let deleteWhere = attributeSpec.relation.filter || {};
        deleteWhere[attributeSpec.relation.foreignKey] =
          payload[attributeSpec.relation.localKey];

        const insertObjects = resourcePayload.map((value) => {
          const insertObject = { ...deleteWhere };
          insertObject[attributeSpec.relation.resourceForeignKey] = value;
          return insertObject;
        });

        operations.push({
          resourceSpec: {
            meta: {
              table: attributeSpec.relation.pivotTable,
            },
          },
          operation: "delete",
          where: deleteWhere,
        });

        if (insertObjects.length > 0) {
          operations.push({
            resourceSpec: {
              meta: {
                table: attributeSpec.relation.pivotTable,
              },
            },
            operation: "insert",
            payload: insertObjects,
          });
        }
      }
    }

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
      includeFacets: mentalAction.apiConfig.includeFacets || false,
    });
  }

  mentalAction["operations"] = operations;

  context.mentalAction = mentalAction;

  return context;
};

module.exports = getOperations;
