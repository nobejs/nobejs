const executeSequence = require("../helpers/executeSequence");
const enhanceWithHooks = require("../helpers/enhanceWithHooks");
const cleanPayload = require("../helpers/cleanPayload");

module.exports = async (context) => {
  const { mentalAction, resourceModels } = context;

  const sequence = await enhanceWithHooks(context, {
    prepare: [cleanPayload],
    authorize: [],
    validate: [],
    handle: [],
    respond: [],
  });

  context = await executeSequence(context, sequence);

  let columnsData = {};

  let resourceSpec = resourceModels[mentalAction.resource];
  columnsData["relations"] = mentalAction["relationColumns"];
  columnsData["mutations"] = mentalAction["mutationColumns"];

  return { respondResult: { ...columnsData, ...resourceSpec } };
};
