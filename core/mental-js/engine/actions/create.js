const generate = require("../helpers/generate");
const validate = require("../helpers/validate");
const cleanPayload = require("../helpers/cleanPayload");
const getOperations = require("../helpers/getOperations");
const executeSequence = require("../helpers/executeSequence");

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = async (mentalAction, resourceModels, mentalConfig) => {
  const resourceSpec = resourceModels[mentalAction.resource];
  const attributes = resourceSpec.attributes;
  let forIndex = 0;

  await executeSequence(["b", "c"]);

  const requiredHooks = require(mentalConfig.hooksPath);

  const beforePrepareHook = `beforePrepare${capitalizeFirstLetter(
    mentalAction.action
  )}${capitalizeFirstLetter(mentalAction.resource)}`;

  if (requiredHooks[beforePrepareHook]) {
    mentalAction = await requiredHooks[beforePrepareHook](mentalAction);
  }

  console.log("mentalAction", beforePrepareHook);

  // Start Prepare
  {
    mentalAction = await cleanPayload(resourceSpec, mentalAction);
    // We have to first perform the "generate" operations
    mentalAction = await generate(attributes, mentalAction);
  }
  // --------------- End Prepare

  // Start Authorization
  {
    const requiredBasicPermission = `${mentalAction.action}_${mentalAction.resource}`;

    if (
      mentalAction.permissions !== "*" &&
      !mentalAction.permissions.includes(requiredBasicPermission)
    ) {
      throw {
        statusCode: 403,
        message: "Forbidden",
      };
    }
  }
  // --------------- End Authorization

  // Start Validation
  {
    mentalAction = await validate(attributes, mentalAction);
  }
  // --------------- End Validation

  // Start Handling
  {
    const operations = await getOperations(mentalAction, resourceSpec);

    console.log("operations", operations);

    let opResult = await mentalConfig.operator(operations);

    mentalAction["opResult"] = opResult;
  }
  // --------------- End Handling

  // Start Respond
  {
    mentalAction["respondResult"] = mentalAction["opResult"];
  }
  // --------------- End Respond

  // console.log("mentalAction", mentalAction);

  return mentalAction;
};
