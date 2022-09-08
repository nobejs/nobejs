const mentalFactory = require("./factory");
const executeAction = require("./actions");

const executeRoute = async (mentalRoute, frameworkData) => {
  const resolveUser = mentalFactory.getResolveUserFn();
  const resolvePayload = mentalFactory.getResolvePayloadFn();

  const permissions = await resolveUser(mentalRoute, frameworkData);
  const payload = await resolvePayload(mentalRoute, frameworkData);

  let result = await executeAction({
    resourceModels: mentalFactory.getResourceModels(),
    mentalConfig: mentalFactory.getConfig(),
    mentalAction: {
      resource: mentalRoute.resource,
      action: mentalRoute.action,
      permissions,
      payload,
    },
  });
  return result;
};

module.exports = executeRoute;
