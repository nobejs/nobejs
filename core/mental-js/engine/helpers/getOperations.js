const pickKeysFromObject = requireUtil("pickKeysFromObject");

module.exports = async (mentalAction, resourceSpec) => {
  const operations = [];
  let payload = mentalAction.payload;
  let action = mentalAction.action;

  console.log("payload", payload);

  if (action === "create") {
    operations.push({
      resourceSpec: resourceSpec,
      operation: "insert",
      payload: payload,
    });

    let getWhere = pickKeysFromObject(payload, mentalAction.primaryColumns);

    operations.push({
      resourceSpec: resourceSpec,
      operation: "select_first",
      where: getWhere,
    });
  }

  return operations;
};
