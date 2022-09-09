const executeActionInternally = require("../executeActionInternally");
const prepareIncludes = require("./prepareIncludes");

const fillBelongsToOneResources = async (context) => {
  const { mentalAction, resourceModels, mentalConfig } = context;
  const { belongsToOneColumns, belongsToOneMappings } = mentalAction;
  let currentData =
    context.mentalAction["opResult"]["data"] === undefined
      ? [context.mentalAction["opResult"]]
      : context.mentalAction["opResult"]["data"];

  let includes = prepareIncludes(
    mentalAction,
    belongsToOneColumns,
    belongsToOneMappings
  );

  for (let index = 0; index < belongsToOneColumns.length; index++) {
    const column = belongsToOneColumns[index];
    const columnSpec = belongsToOneMappings[column];

    if (!includes.includes(columnSpec.identifier)) {
      continue;
    }

    // console.log("columnSpec", columnSpec.identifier);

    let allColumnValues = currentData.map((d) => {
      return d[column];
    });

    allColumnValues = [...new Set(allColumnValues)];

    const resourceSpec = resourceModels[columnSpec.relation.resource];

    const internalPayload = {
      limitBy: {
        per_page: undefined,
        page: 1,
      },
      filterBy: [
        {
          attribute: columnSpec.relation.foreignKey,
          op: "in",
          value: allColumnValues,
        },
      ],
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
          currentDataElement[column] ===
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

module.exports = fillBelongsToOneResources;
