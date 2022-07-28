var uuid = require("uuid");

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
    if (attribute.operations && attribute.operations[action]) {
      for (let index = 0; index < payload.length; index++) {
        const item = payload[index];
        item[attribute.identifier] = generateAttribute(
          attribute.operations[action].generate
        );
        payload[index] = item;
      }
    }
  }

  mentalAction["payload"] = payload;

  return mentalAction;
};
