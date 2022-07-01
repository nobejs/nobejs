const pickKeysFromObject = requireUtil("pickKeysFromObject");

const mapObjectToResource = (object, resource) => {
  let columns = resource.attributes
    .filter((c) => {
      return c.type !== "relation";
    })
    .map((c) => {
      return `${c.name}`;
    });

  return pickKeysFromObject(object, columns);
};

const findPrimaryKey = (resource) => {
  let columns = resource.attributes
    .filter((c) => {
      return c.type !== "relation" && c.primary === true;
    })
    .map((c) => {
      return `${c.name}`;
    });

  return columns[0];
};

module.exports = {
  mapObjectToResource,
  findPrimaryKey,
};
