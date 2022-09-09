const prepareMutationIncludes = (mentalAction, attributes) => {
  let includes = [];

  if (mentalAction.apiConfig.includeMutations !== undefined) {
    if (Array.isArray(mentalAction.apiConfig.includeMutations)) {
      return mentalAction.apiConfig.includeMutations;
    }

    if (mentalAction.apiConfig.includeMutations === "*") {
      for (let index = 0; index < attributes.length; index++) {
        const attribute = attributes[index];
        includes.push(attribute.identifier);
      }
    }
  }

  return includes;
};

module.exports = prepareMutationIncludes;
