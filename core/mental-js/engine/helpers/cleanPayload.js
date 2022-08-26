var uuid = require("uuid");
const { resolveByDot } = require("./utils");
const pickKeysFromObject = requireUtil("pickKeysFromObject");

const cleanPayload = async (context) => {
  const { mentalAction, resourceModels, mentalConfig } = context;

  if (mentalAction.browser) {
    let payload = mentalAction.payload;

    let otherKeys = [];

    if (mentalAction.action === "browse") {
      otherKeys = ["limitBy", "sortBy", "filterBy"];
    }

    payload = pickKeysFromObject(payload, [...otherKeys]);

    mentalAction["payload"] = payload;
    context.mentalAction = mentalAction;
    return context;
  }

  if (mentalAction.resource) {
    const resourceSpec = resourceModels[mentalAction.resource];
    const attributes = resourceSpec.attributes;

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

    let belongsToOneColumns = attributes
      .filter((c) => {
        return c.relation && c.relation.type === "belongs_to_one";
      })
      .map((c) => {
        return `${c.identifier}`;
      });

    // console.log("before cleaning", payload);

    let otherKeys = [];

    if (mentalAction.action === "read") {
      otherKeys = ["limitBy", "sortBy", "filterBy"];
    }

    payload = pickKeysFromObject(payload, [
      ...directColumns,
      ...belongsToOneColumns,
      ...otherKeys,
    ]);

    mentalAction["payload"] = payload;
    mentalAction["directColumns"] = directColumns;
    mentalAction["belongsToOneColumns"] = belongsToOneColumns;
    mentalAction["primaryColumns"] = resourceSpec.primary;
    context.mentalAction = mentalAction;

    return context;
  }
};

module.exports = cleanPayload;
