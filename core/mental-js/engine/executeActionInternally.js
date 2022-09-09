const executeActionInternally = async (mentalRoute, payload) => {
  const executeAction = require("./actions");
  const mentalFactory = require("./factory");

  let result = await executeAction({
    resourceModels: mentalFactory.getResourceModels(),
    mentalConfig: mentalFactory.getConfig(),
    mentalAction: {
      resource: mentalRoute.resource,
      action: mentalRoute.action,
      permissions: "*",
      payload,
    },
  });
  return result;
};

module.exports = executeActionInternally;
