const generate = require("../helpers/generate");
const validate = require("../helpers/validate");
const cleanPayload = require("../helpers/cleanPayload");
const getOperations = require("../helpers/getOperations");
const executeSequence = require("../helpers/executeSequence");
const enhanceWithHooks = require("../helpers/enhanceWithHooks");

module.exports = async (context) => {
  const { mentalAction, resourceModels, mentalConfig } = context;

  const authorize = (context) => {
    const { mentalAction } = context;

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

    return context;
  };

  const runOperations = async (context) => {
    const { mentalAction, resourceModels, mentalConfig } = context;
    const { operations } = mentalAction;
    let opResult = await mentalConfig.operator(operations);
    mentalAction["opResult"] = opResult;
    context.mentalAction = mentalAction;
    return context;
  };

  const sequence = await enhanceWithHooks(context, {
    prepare: [cleanPayload, generate],
    authorize: [authorize],
    validate: [validate],
    handle: [getOperations, runOperations],
    respond: [],
  });

  context = await executeSequence(context, sequence);

  return { respondResult: context.mentalAction["opResult"] };
};
