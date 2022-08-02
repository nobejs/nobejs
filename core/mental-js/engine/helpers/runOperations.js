const runOperations = async (context) => {
  const { mentalAction, resourceModels, mentalConfig } = context;
  const { operations } = mentalAction;
  let opResult = await mentalConfig.operator(operations);
  mentalAction["opResult"] = opResult;
  context.mentalAction = mentalAction;
  return context;
};

module.exports = runOperations;
