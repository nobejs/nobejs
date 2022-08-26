const runTransformation = require("../helpers/runTransformation");

const runTransformationsForBrowserFilters = async (context) => {
  const { mentalAction, resourceModels, browserModels, mentalConfig } = context;

  if (mentalAction.browser) {
    const browserSpec = browserModels[mentalAction.browser];

    let filterBy = mentalAction.payload.filterBy || [];
    let newFilterBy = {};
    let filters = [];

    filterBy.forEach((element) => {
      newFilterBy[element.attribute] = element.value;
    });

    for (let index = 0; index < filterBy.length; index++) {
      const element = filterBy[index];
      const browserSpecFilter = browserSpec.filterBy[element.attribute];

      if (browserSpecFilter) {
        const transformations = browserSpecFilter.transformations;
        if (transformations !== undefined && transformations.length > 0) {
          let transformedValue = newFilterBy;

          for (let index = 0; index < transformations.length; index++) {
            const transformation = transformations[index];
            transformedValue = await runTransformation(
              context,
              transformedValue,
              transformation
            );
          }

          let whereClause = {};
          whereClause["op"] = "in";
          whereClause["column"] = browserSpecFilter.resolveTo;
          whereClause["value"] = transformedValue[element.attribute];
          filters.push(whereClause);
        } else {
          let whereClause = {};
          whereClause["op"] = "in";
          whereClause["column"] = browserSpecFilter.resolveTo;
          whereClause["value"] = element.value;
          filters.push(whereClause);
        }
      }
    }

    mentalAction["filters"] = filters;
    context.mentalAction = mentalAction;

    return context;
  }

  return context;
};

module.exports = runTransformationsForBrowserFilters;
