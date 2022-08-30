const fillBelongsToOneResources = async (context) => {
  const { mentalAction, resourceModels, mentalConfig } = context;
  const { belongsToOneColumns, belongsToOneMappings } = mentalAction;
  let currentData = context.mentalAction["opResult"]["data"];

  for (let index = 0; index < belongsToOneColumns.length; index++) {
    const operations = [];

    const column = belongsToOneColumns[index];
    const columnSpec = belongsToOneMappings[column];
    let allColumnValues = currentData.map((d) => {
      return d[column];
    });
    allColumnValues = [...new Set(allColumnValues)];

    const resourceSpec = resourceModels[columnSpec.relation.resource];

    let whereClause = {};
    whereClause["op"] = "in";
    whereClause["column"] = columnSpec.relation.source;
    whereClause["value"] = allColumnValues;

    operations.push({
      resourceSpec: resourceSpec,
      operation: "select",
      filters: [whereClause],
      selectColumns: "*",
    });

    let relationData = await mentalConfig.operator(operations);
    relationData = relationData["data"];

    for (
      let indexRelation = 0;
      indexRelation < relationData.length;
      indexRelation++
    ) {
      const relationDataElement = relationData[indexRelation];

      for (
        let indexCurrent = 0;
        indexCurrent < currentData.length;
        indexCurrent++
      ) {
        const currentDataElement = currentData[indexCurrent];
        if (
          currentDataElement[column] ===
          relationDataElement[columnSpec.relation.source]
        ) {
          currentDataElement[columnSpec.identifier] = relationDataElement;
          currentData[indexCurrent] = currentDataElement;
        }
      }
    }

    // console.log("relationData", relationData);
  }

  return context;
};

module.exports = fillBelongsToOneResources;
