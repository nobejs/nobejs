const fillHasManyWithPivotResources = async (context) => {
  const { mentalAction, resourceModels, mentalConfig } = context;
  const { hasManyViaPivotColumns, hasManyViaPivotMappings } = mentalAction;

  // Get the current data

  let currentData =
    context.mentalAction["opResult"]["data"] === undefined
      ? [context.mentalAction["opResult"]]
      : context.mentalAction["opResult"]["data"];

  // console.log("hasManyViaPivotColumns", hasManyViaPivotColumns);

  for (let index = 0; index < hasManyViaPivotColumns.length; index++) {
    const operations = [];

    const column = hasManyViaPivotColumns[index];

    const columnSpec = hasManyViaPivotMappings[column];

    // console.log("hasManyColumns", column, columnSpec);
    let localKey = columnSpec.relation.localKey;
    let filters = columnSpec.relation.filter;

    let allColumnValues = currentData.map((d) => {
      return d[localKey];
    });

    allColumnValues = [...new Set(allColumnValues)];

    // console.log("allColumnValues", columnSpec);

    const resourceSpec = resourceModels[columnSpec.relation.resource];

    let whereClause = {};
    whereClause["op"] = "in";
    whereClause["column"] = columnSpec.relation.foreignKey;
    whereClause["value"] = allColumnValues;

    let filterWhereClauses = [];

    for (const key in filters) {
      if (Object.hasOwnProperty.call(filters, key)) {
        const value = filters[key];

        filterWhereClauses.push({
          column: key,
          op: "eq",
          value: value,
        });
      }
    }

    filterWhereClauses.push(whereClause);

    // console.log("filterWhereClauses has many", filterWhereClauses);

    operations.push({
      resourceSpec: {
        meta: {
          table: columnSpec.relation.pivotTable,
        },
      },
      operation: "select",
      filters: filterWhereClauses,
      selectColumns: "*",
    });

    let relationData = await mentalConfig.operator(operations);
    relationData = relationData["data"];

    // console.log("relationData", relationData);

    for (
      let indexCurrent = 0;
      indexCurrent < currentData.length;
      indexCurrent++
    ) {
      const currentDataElement = currentData[indexCurrent];

      const hasManyData = relationData.filter((relationDataElement) => {
        return (
          currentDataElement[localKey] ===
          relationDataElement[columnSpec.relation.foreignKey]
        );
      });

      const resourceKeys = hasManyData.map((h) => {
        return h[columnSpec.relation.resourceForeignKey];
      });

      let resourceWhereClause = {};
      resourceWhereClause["op"] = "in";
      resourceWhereClause["column"] = columnSpec.relation.resourceLocalKey;
      resourceWhereClause["value"] = resourceKeys;

      // console.log("resourceKeys", resourceKeys);

      let operations = [];

      operations.push({
        resourceSpec: resourceSpec,
        operation: "select",
        filters: [resourceWhereClause],
        selectColumns: "*",
      });

      let resourceData = await mentalConfig.operator(operations);
      resourceData = resourceData["data"];

      currentDataElement[columnSpec.identifier] = resourceData;
      currentData[indexCurrent] = currentDataElement;
    }
  }

  return context;
};

module.exports = fillHasManyWithPivotResources;
