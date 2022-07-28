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

module.exports = async (attributes, mentalAction) => {
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

  mentalAction["payload"] = payload;

  return mentalAction;
};
