const getOperations = require("../helpers/getOperations");
const runOperations = require("../helpers/runOperations");
const runTransformations = require("../helpers/runTransformations");
const runTransformationsForBrowserFilters = require("../helpers/runTransformationsForBrowserFilters");
const authorize = require("../helpers/authorize");
const executeSequence = require("../helpers/executeSequence");
const enhanceWithHooks = require("../helpers/enhanceWithHooks");
const cleanPayload = require("../helpers/cleanPayload");

module.exports = async (context) => {
  const sequence = await enhanceWithHooks(context, {
    prepare: [cleanPayload],
    authorize: [authorize],
    validate: [],
    handle: [
      runTransformationsForBrowserFilters,
      getOperations,
      runOperations,
      runTransformations,
    ],
    respond: [],
  });

  context = await executeSequence(context, sequence);

  return { respondResult: context.mentalAction["opResult"] };
};
