const generate = require("../helpers/generate");
const validate = require("../helpers/validate");
const cleanPayload = require("../helpers/cleanPayload");
const getOperations = require("../helpers/getOperations");

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = async (
  mentalAction,
  resourceModels,
  mentalConfig,
  checkBack
) => {
  const resourceSpec = resourceModels[mentalAction.resource];
  const attributes = resourceSpec.attributes;
  let forIndex = 0;

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
    mentalAction = await checkBack(mentalAction, "beforePrepare");
    mentalAction = await cleanPayload(resourceSpec, mentalAction);
    // We have to first perform the "generate" operations
    mentalAction = await generate(attributes, mentalAction);
    mentalAction = await checkBack(mentalAction, "after_prepare");
  }
  // --------------- End Prepare

  // Start Authorization
  {
    mentalAction = await checkBack(mentalAction, "before_authorization");

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

    mentalAction = await checkBack(mentalAction, "after_authorization");
  }
  // --------------- End Authorization

  // Start Validation
  {
    mentalAction = await checkBack(mentalAction, "before_validation");
    mentalAction = await validate(attributes, mentalAction);
    mentalAction = await checkBack(mentalAction, "after_validation");
  }
  // --------------- End Validation

  // Start Handling
  {
    mentalAction = await checkBack(mentalAction, "before_handling");

    const operations = await getOperations(mentalAction, resourceSpec);

    console.log("operations", operations);

    let opResult = await mentalConfig.operator(operations);

    mentalAction["opResult"] = opResult;

    mentalAction = await checkBack(mentalAction, "after_handling");
  }
  // --------------- End Handling

  // Start Respond
  {
    mentalAction = await checkBack(mentalAction, "before_respond");
    mentalAction["respondResult"] = mentalAction["opResult"];
    mentalAction = await checkBack(mentalAction, "after_respond");
  }
  // --------------- End Respond

  // console.log("mentalAction", mentalAction);

  return mentalAction;
};
