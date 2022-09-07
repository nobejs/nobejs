const fillHasManyResources = async (context) => {
  const { mentalAction, resourceModels, mentalConfig } = context;
  const { hasManyColumns, hasManyMappings } = mentalAction;

  // Get the current data

  let currentData =
    context.mentalAction["opResult"]["data"] === undefined
      ? [context.mentalAction["opResult"]]
      : context.mentalAction["opResult"]["data"];

  // console.log("hasManyColumns", hasManyColumns);

  for (let index = 0; index < hasManyColumns.length; index++) {
    const operations = [];

    const column = hasManyColumns[index];

    const columnSpec = hasManyMappings[column];

    // console.log("hasManyColumns", column, columnSpec);
    let localKey = columnSpec.relation.localKey;
    let filters = columnSpec.relation.filter;

    let allColumnValues = currentData.map((d) => {
      return d[localKey];
    });

    allColumnValues = [...new Set(allColumnValues)];

    // console.log("allColumnValues", allColumnValues);

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
      resourceSpec: resourceSpec,
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

      currentDataElement[columnSpec.identifier] = hasManyData;
      currentData[indexCurrent] = currentDataElement;
    }
  }

  return context;
};

module.exports = fillHasManyResources;
