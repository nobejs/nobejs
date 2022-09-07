const getOperations = require("../helpers/getOperations");
const runOperations = require("../helpers/runOperations");
const fillBelongsToOneResources = require("../helpers/fillBelongsToOneResources");
const fillHasOneResources = require("../helpers/fillHasOneResources");
const fillHasManyResources = require("../helpers/fillHasManyResources");
const runTransformationsForFilters = require("../helpers/runTransformationsForFilters");
const authorize = require("../helpers/authorize");
const executeSequence = require("../helpers/executeSequence");
const enhanceWithHooks = require("../helpers/enhanceWithHooks");
const cleanPayload = require("../helpers/cleanPayload");
const runTransformations = require("../helpers/runTransformations");
const saveFacet = require("../helpers/saveFacet");
const generateFacets = require("../helpers/generateFacets");

module.exports = async (context) => {
  const sequence = await enhanceWithHooks(context, {
    prepare: [cleanPayload],
    authorize: [authorize],
    validate: [],
    handle: [
      runTransformationsForFilters,
      getOperations,
      runOperations,
      fillBelongsToOneResources,
      fillHasOneResources,
      fillHasManyResources,
      runTransformations,
    ],
    respond: [generateFacets],
  });

  context = await executeSequence(context, sequence);

  return { respondResult: context.mentalAction["opResult"] };
};
