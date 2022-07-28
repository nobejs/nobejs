var uuid = require("uuid");
const { resolveByDot } = require("./utils");
const pickKeysFromObject = requireUtil("pickKeysFromObject");

module.exports = async (resourceSpec, mentalAction) => {
  let attributes = resourceSpec.attributes;
  let payload = mentalAction.payload;
  let action = mentalAction.action;
  let forIndex = 0;

  let directColumns = attributes
    .filter((c) => {
      return !c.relation;
    })
    .map((c) => {
      return `${c.identifier}`;
    });

  payload = pickKeysFromObject(payload, directColumns);

  mentalAction["payload"] = payload;
  mentalAction["directColumns"] = directColumns;
  mentalAction["primaryColumns"] = resourceSpec.primary;

  return mentalAction;
};
