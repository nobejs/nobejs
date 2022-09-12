const generate = require("../helpers/generate");
const validate = require("../helpers/validate");
const cleanPayload = require("../helpers/cleanPayload");
const getOperations = require("../helpers/getOperations");
const runOperations = require("../helpers/runOperations");
const authorize = require("../helpers/authorize");
const executeSequence = require("../helpers/executeSequence");
const enhanceWithHooks = require("../helpers/enhanceWithHooks");
const deleteHasManyResources = require("../helpers/deleteHasManyResources");
const deleteHasOneResources = require("../helpers/deleteHasOneResources");

module.exports = async (context) => {
  const sequence = await enhanceWithHooks(context, {
    prepare: [cleanPayload, generate],
    authorize: [authorize],
    validate: [validate],
    handle: [
      getOperations,
      runOperations,
      deleteHasOneResources,
      deleteHasManyResources,
    ],
    respond: [],
  });

  context = await executeSequence(context, sequence);

  return { respondResult: context.mentalAction["opResult"] };
};
