const runTransformation = require("../helpers/runTransformation");

const runTransformations = async (context) => {
  const { mentalAction, resourceModels, mentalConfig } = context;

  const resourceSpec = resourceModels[mentalAction.resource];
  const attributes = resourceSpec.attributes;
  let currentData = context.mentalAction["opResult"]["data"];
  let newOpResult = [];

  // console.log("currentData", currentData);

  let forIndex = 0;

  for (let index = 0; index < currentData.length; index++) {
    const currentDataItem = currentData[index];
    let transformed = currentDataItem;

    for (forIndex = 0; forIndex < attributes.length; forIndex++) {
      const attribute = attributes[forIndex];
      const transformations = attribute.transformations;

      // console.log("transformations", transformations);

      if (
        transformations !== undefined &&
        attribute.mutateFrom !== undefined &&
        transformations.length > 0
      ) {
        console.log("attribute", attribute);
        let transformedValue = currentDataItem;
        for (let index = 0; index < transformations.length; index++) {
          const transformation = transformations[index];
          transformedValue = await runTransformation(
            context,
            transformedValue,
            transformation
          );
        }
        console.log("transformedValue", transformedValue);
        transformed[attribute.identifier] = transformedValue;
      } else {
        // const valueFromSource = currentDataItem[attribute.source];
        // transformed[attribute.identifier] = valueFromSource;
      }
    }
    newOpResult.push(transformed);
  }

  context.mentalAction["opResult"]["data"] = newOpResult;

  return context;

  //   console.log("runTransformations", context.mentalAction["opResult"]);
  return context;
};

module.exports = runTransformations;
