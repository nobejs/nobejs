var uuid = require("uuid");
const { resolveByDot } = require("./utils");

const generateAttribute = (type) => {
  switch (type) {
    case "uuid":
      return uuid.v4();
      break;

    case "datetime":
      return new Date().toISOString();
      break;

    default:
      break;
  }
};

const generate = async (context) => {
  const { mentalAction, resourceModels, mentalConfig } = context;
  const resourceSpec = resourceModels[mentalAction.resource];
  const attributes = resourceSpec.attributes;
  let payload = mentalAction.payload;
  let action = mentalAction.action;

  const attributesWithOperations = attributes.filter((a) => {
    return a.operations !== undefined;
  });

  let forIndex = 0;

  for (forIndex = 0; forIndex < attributesWithOperations.length; forIndex++) {
    const attribute = attributesWithOperations[forIndex];

    const operationKeys = Object.keys(attribute.operations);

    for (let index = 0; index < operationKeys.length; index++) {
      const operationKey = operationKeys[index];
      const operationActions = operationKey.split(",");
      if (operationActions.includes("*") || operationActions.includes(action)) {
        if (resolveByDot(`operations.${operationKey}.generate`, attribute)) {
          payload[attribute.identifier] = generateAttribute(
            attribute.operations[operationKey].generate
          );
        }
      }
    }
  }

  mentalAction.payload = payload;
  context.mentalAction = mentalAction;
  return context;
};

module.exports = generate;
