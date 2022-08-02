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
  let forIndex = 0;

  for (forIndex = 0; forIndex < attributes.length; forIndex++) {
    const attribute = attributes[forIndex];

    if (resolveByDot(`operations.${action}.generate`, attribute)) {
      payload[attribute.identifier] = generateAttribute(
        attribute.operations[action].generate
      );
    }
  }

  context.mentalAction = mentalAction;
  return context;
};

module.exports = generate;
