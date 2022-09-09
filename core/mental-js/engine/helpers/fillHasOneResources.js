const executeActionInternally = require("../executeActionInternally");
const prepareIncludes = require("./prepareIncludes");

const fillHasOneResources = async (context) => {
  const { mentalAction, resourceModels, mentalConfig } = context;
  const { hasOneColumns, hasOneMappings } = mentalAction;

  let includes = prepareIncludes(mentalAction, hasOneColumns, hasOneMappings);

  // Get the current data

  let currentData =
    context.mentalAction["opResult"]["data"] === undefined
      ? [context.mentalAction["opResult"]]
      : context.mentalAction["opResult"]["data"];

  for (let index = 0; index < hasOneColumns.length; index++) {
    const column = hasOneColumns[index];
    const columnSpec = hasOneMappings[column];

    if (!includes.includes(columnSpec.identifier)) {
      continue;
    }

    let localKey = columnSpec.relation.localKey;
    let filters = columnSpec.relation.filter;

    let allColumnValues = currentData.map((d) => {
      return d[localKey];
    });

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
      limitBy: {
        per_page: 1,
        page: 1,
      },
      sortBy: [{ attribute: "created_at", order: "desc" }],
      filterBy: filterWhereClauses,
    };

    const internalRelationData = await executeActionInternally(
      {
        resource: resourceSpec.name,
        action: "read",
      },
      internalPayload
    );

    relationData = internalRelationData["respondResult"]["data"];

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
  }

  return context;
};

module.exports = fillHasOneResources;
