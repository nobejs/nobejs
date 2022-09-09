const prepareIncludes = (mentalAction, relationColumns, relationMappings) => {
  let includes = [];

  if (mentalAction.apiConfig.includes !== undefined) {
    if (Array.isArray(mentalAction.apiConfig.includes)) {
      return mentalAction.apiConfig.includes;
    }

    if (mentalAction.apiConfig.includes === "*") {
      for (let index = 0; index < relationColumns.length; index++) {
        const column = relationColumns[index];
        const columnSpec = relationMappings[column];
        includes.push(columnSpec.identifier);
      }
    }
  }

  return includes;
};

module.exports = prepareIncludes;
