var uuid = require("uuid");
const { resolveByDot } = require("./utils");
const pickKeysFromObject = requireUtil("pickKeysFromObject");

const cleanPayload = async (context) => {
  const { mentalAction, resourceModels, mentalConfig } = context;

  const resourceSpec = resourceModels[mentalAction.resource];
  const attributes = resourceSpec.attributes;

  let payload = mentalAction.payload;
  let action = mentalAction.action;
  let forIndex = 0;

  let directColumns = attributes
    .filter((c) => {
      return !c.relation && !c.mutateFrom;
    })
    .map((c) => {
      return `${c.identifier}`;
    });

  let mutationColumns = attributes
    .filter((c) => {
      return c.mutateFrom;
    })
    .map((c) => {
      return `${c.identifier}`;
    });

  // console.log("directColumns", mutationColumns);

  let belongsToOneColumns = attributes
    .filter((c) => {
      return c.relation && c.relation.type === "belongs_to_one";
    })
    .map((c) => {
      return `${c.relation.resolveTo || c.identifier}`;
    });

  let belongsToOneMappings = attributes
    .filter((c) => {
      return c.relation && c.relation.type === "belongs_to_one";
    })
    .reduce(
      (obj, c) =>
        Object.assign(obj, {
          [`${c.relation.resolveTo || c.identifier}`]: c,
        }),
      {}
    );

  let hasOneColumns = attributes
    .filter((c) => {
      return c.relation && c.relation.type === "has_one";
    })
    .map((c) => {
      return `${c.relation.resolveTo || c.identifier}`;
    });

  let hasOneMappings = attributes
    .filter((c) => {
      return c.relation && c.relation.type === "has_one";
    })
    .reduce(
      (obj, c) =>
        Object.assign(obj, {
          [`${c.relation.resolveTo || c.identifier}`]: c,
        }),
      {}
    );

  let hasManyColumns = attributes
    .filter((c) => {
      return c.relation && c.relation.type === "has_many";
    })
    .map((c) => {
      return `${c.relation.resolveTo || c.identifier}`;
    });

  let hasManyMappings = attributes
    .filter((c) => {
      return c.relation && c.relation.type === "has_many";
    })
    .reduce(
      (obj, c) =>
        Object.assign(obj, {
          [`${c.relation.resolveTo || c.identifier}`]: c,
        }),
      {}
    );

  let hasManyViaPivotColumns = attributes
    .filter((c) => {
      return c.relation && c.relation.type === "has_many_via_pivot";
    })
    .map((c) => {
      return `${c.relation.resolveTo || c.identifier}`;
    });

  let hasManyViaPivotMappings = attributes
    .filter((c) => {
      return c.relation && c.relation.type === "has_many_via_pivot";
    })
    .reduce(
      (obj, c) =>
        Object.assign(obj, {
          [`${c.relation.resolveTo || c.identifier}`]: c,
        }),
      {}
    );

  // console.log("before cleaning", attributes, hasOneColumns);

  let otherKeys = [];

  if (mentalAction.action === "read") {
    otherKeys = ["limitBy", "sortBy", "filterBy"];
  }

  if (payload.apiConfig !== undefined) {
    mentalAction["apiConfig"] = payload.apiConfig;
  } else {
    mentalAction["apiConfig"] = {};
  }

  // console.log("includes -----", includes);

  const hasManyPayload = pickKeysFromObject(payload, [
    ...hasManyViaPivotColumns,
  ]);

  payload = pickKeysFromObject(payload, [
    ...directColumns,
    ...belongsToOneColumns,
    ...otherKeys,
  ]);

  mentalAction["payload"] = payload;
  mentalAction["hasManyPayload"] = hasManyPayload;
  mentalAction["directColumns"] = directColumns;
  mentalAction["belongsToOneColumns"] = belongsToOneColumns;
  mentalAction["belongsToOneMappings"] = belongsToOneMappings;
  mentalAction["hasOneColumns"] = hasOneColumns;
  mentalAction["hasOneMappings"] = hasOneMappings;
  mentalAction["hasManyColumns"] = hasManyColumns;
  mentalAction["hasManyMappings"] = hasManyMappings;
  mentalAction["hasManyViaPivotColumns"] = hasManyViaPivotColumns;
  mentalAction["hasManyViaPivotMappings"] = hasManyViaPivotMappings;
  mentalAction["mutationColumns"] = mutationColumns;

  mentalAction["primaryColumns"] = resourceSpec.primary;
  context.mentalAction = mentalAction;

  return context;
};

module.exports = cleanPayload;
