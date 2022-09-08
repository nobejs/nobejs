const createAction = require("./create");
const updateAction = require("./update");
const readAction = require("./read");
const deleteAction = require("./delete");

const executeAction = async (context) => {
  const { mentalAction } = context;

  // console.log("executeAction", mentalAction);

  // const customFunctions = engine.getCustomFunctions();
  // console.log("en", customFunctions);

  // await customFunctions["uniqueForAuthor"].apply(null, [
  //   { resource, action, permissions, payload },
  // ]);

  if (mentalAction.action === "create") {
    return await createAction(context);
  }

  if (mentalAction.action === "update") {
    return await updateAction(context);
  }

  if (mentalAction.action === "patch") {
    return await updateAction(context);
  }

  if (mentalAction.action === "read") {
    return await readAction(context);
  }

  if (mentalAction.action === "delete") {
    return await deleteAction(context);
  }

  if (mentalAction.action === "crud_config") {
    const { resourceModels } = context;
    const resourceSpec = resourceModels[mentalAction.resource];
    return { respondResult: resourceSpec };
  }

  return { respondResult: mentalAction };
};

module.exports = executeAction;
