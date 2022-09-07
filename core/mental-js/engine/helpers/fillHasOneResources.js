const fillHasOneResources = async (context) => {
  const { mentalAction, resourceModels, mentalConfig } = context;
  const { hasOneColumns, hasOneMappings } = mentalAction;

  // Get the current data

  let currentData =
    context.mentalAction["opResult"]["data"] === undefined
      ? [context.mentalAction["opResult"]]
      : context.mentalAction["opResult"]["data"];

  // console.log("hasOneColumns", hasOneColumns);

  for (let index = 0; index < hasOneColumns.length; index++) {
    const operations = [];

    const column = hasOneColumns[index];

    const columnSpec = hasOneMappings[column];

    // console.log("hasOneColumns", column, columnSpec);
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

    console.log("filterWhereClauses", filterWhereClauses);

    operations.push({
      resourceSpec: resourceSpec,
      operation: "select",
      filters: filterWhereClauses,
      selectColumns: "*",
      sortBy: [{ column: "created_at", order: "desc" }],
      limit: 1,
    });

    let relationData = await mentalConfig.operator(operations);
    relationData = relationData["data"];

    for (
      let indexCurrent = 0;
      indexCurrent < currentData.length;
      indexCurrent++
    ) {
      const currentDataElement = currentData[indexCurrent];

      const hasOneData = relationData.filter((relationDataElement) => {
        return (
          currentDataElement[localKey] ===
          relationDataElement[columnSpec.relation.foreignKey]
        );
      });

      if (hasOneData.length > 0) {
        currentDataElement[columnSpec.identifier] = hasOneData[0];
        currentData[indexCurrent] = currentDataElement;
      }
    }

    // for (
    //   let indexRelation = 0;
    //   indexRelation < relationData.length;
    //   indexRelation++
    // ) {
    //   const relationDataElement = relationData[indexRelation];

    //   for (
    //     let indexCurrent = 0;
    //     indexCurrent < currentData.length;
    //     indexCurrent++
    //   ) {
    //     const currentDataElement = currentData[indexCurrent];
    //     if (
    //       currentDataElement[localKey] ===
    //       relationDataElement[columnSpec.relation.foreignKey]
    //     ) {
    //       currentDataElement[columnSpec.identifier] = relationDataElement;
    //       currentData[indexCurrent] = currentDataElement;
    //     }
    //   }
    // }

    // console.log("relationData", relationData);
  }

  return context;
};

module.exports = fillHasOneResources;
