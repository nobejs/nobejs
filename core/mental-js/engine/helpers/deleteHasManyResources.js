const executeActionInternally = require("../executeActionInternally");

const deleteHasManyResources = async (context) => {
  const { mentalAction, resourceModels, mentalConfig } = context;
  const { hasManyColumns, hasManyMappings } = mentalAction;

  let currentData =
    context.mentalAction["opResult"]["data"] === undefined
      ? [context.mentalAction["opResult"]]
      : context.mentalAction["opResult"]["data"];

  for (let index = 0; index < hasManyColumns.length; index++) {
    const column = hasManyColumns[index];

    const columnSpec = hasManyMappings[column];

    let localKey = columnSpec.relation.localKey;
    let filters = columnSpec.relation.filter;

    let allColumnValues = currentData.map((d) => {
      return d[localKey];
    });

    // console.log("allColumnValues", allColumnValues);

    allColumnValues = [...new Set(allColumnValues)];

    const resourceSpec = resourceModels[columnSpec.relation.resource];

    let whereClause = {};
    whereClause["op"] = "in";
    whereClause["attribute"] = columnSpec.relation.foreignKey;
    whereClause["value"] = allColumnValues;

    let filterWhereClauses = [];

    for (const key in filters) {
      if (Object.hasOwnProperty.call(filters, key)) {
        const value = filters[key];

        filterWhereClauses.push({
          attribute: key,
          op: "eq",
          value: value,
        });
      }
    }

    filterWhereClauses.push(whereClause);

    const internalPayload = {
      filterBy: filterWhereClauses,
    };

    // console.log("internalPayload", resourceSpec.name, internalPayload);

    const internalRelationData = await executeActionInternally(
      {
        resource: resourceSpec.name,
        action: "delete",
      },
      internalPayload
    );

    // relationData = internalRelationData["respondResult"]["data"];
  }

  return context;
};

module.exports = deleteHasManyResources;
