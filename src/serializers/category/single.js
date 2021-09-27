const pickKeysFromObject = requireUtil("pickKeysFromObject");

module.exports = (instance) => {
  const attributes = ["uuid", "name"];
  return pickKeysFromObject(instance, attributes);
};
