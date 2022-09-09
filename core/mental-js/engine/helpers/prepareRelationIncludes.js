const prepareRelationIncludes = (
  mentalAction,
  relationColumns,
  relationMappings
) => {
  let includes = [];

  if (mentalAction.apiConfig.includeRelations !== undefined) {
    if (Array.isArray(mentalAction.apiConfig.includeRelations)) {
      return mentalAction.apiConfig.includeRelations;
    }

    if (mentalAction.apiConfig.includeRelations === "*") {
      for (let index = 0; index < relationColumns.length; index++) {
        const column = relationColumns[index];
        const columnSpec = relationMappings[column];
        includes.push(columnSpec.identifier);
      }
    }
  }

  return includes;
};

module.exports = prepareRelationIncludes;
