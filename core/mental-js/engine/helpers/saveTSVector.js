const { resolveByDot } = require("./utils");
const pickKeysFromObject = requireUtil("pickKeysFromObject");
const knex = requireKnex();

const saveTSVector = async (context) => {
  const { mentalAction, resourceModels, mentalConfig } = context;
  const resourceSpec = resourceModels[mentalAction.resource];

  const { belongsToOneColumns, belongsToOneMappings } = mentalAction;
  let currentData =
    context.mentalAction["opResult"]["data"] === undefined
      ? [context.mentalAction["opResult"]]
      : context.mentalAction["opResult"]["data"];

  if (
    resourceSpec["tsVector"] !== undefined &&
    resourceSpec["tsVector"]["tagsColumns"] !== undefined &&
    resourceSpec["tsVector"]["tsvColumn"] !== undefined
  ) {
    let tsVectorAttributes = resourceSpec.attributes.filter((c) => {
      return c.tsVector;
    });

    // console.log("saveTsVector", resourceSpec["tsVector"]);
    // console.log("tsVectorAttributes", tsVectorAttributes);

    for (let cIndex = 0; cIndex < currentData.length; cIndex++) {
      const currentDataItem = currentData[cIndex];
      let tagsArray = [];

      for (let tIndex = 0; tIndex < tsVectorAttributes.length; tIndex++) {
        const tsVectorAttribute = tsVectorAttributes[tIndex];

        // console.log(
        //   "tsVectorAttribute",
        //   tsVectorAttribute.tsVector,
        //   currentDataItem[tsVectorAttribute.identifier]
        // );

        tagsArray.push(
          `${tsVectorAttribute.tsVector.tag}:${
            currentDataItem[tsVectorAttribute.identifier][
              tsVectorAttribute.tsVector.value
            ]
          }`
        );
      }

      let tagsString = tagsArray.map((t) => {
        return `"${t}"`;
      });

      let updateWhere = pickKeysFromObject(
        currentDataItem,
        mentalAction.primaryColumns
      );

      let tsvPayload = {};
      tsvPayload[resourceSpec["tsVector"]["tagsColumns"]] =
        JSON.stringify(tagsArray);
      tsvPayload[resourceSpec["tsVector"]["tsvColumn"]] = knex.raw(
        `array_to_tsvector(\'{${tagsString.join(",")}}\')`
      );

      const operations = [];

      operations.push({
        resourceSpec: resourceSpec,
        operation: "update",
        payload: tsvPayload,
        where: updateWhere,
      });

      await mentalConfig.operator(operations);

      // console.log("tagsString", updateWhere, tsvPayload);
    }
  }

  return context;
};

module.exports = saveTSVector;
