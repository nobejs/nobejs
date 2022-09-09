const runTransformation = require("./runTransformation");

const runTransformationsForFilters = async (context) => {
  const { mentalAction, resourceModels, mentalConfig } = context;

  const resourceSpec = resourceModels[mentalAction.resource];

  let filterBy = mentalAction.payload.filterBy || [];
  let newFilterBy = {};
  let filters = [];

  filterBy = filterBy.filter((f) => {
    return !f.op;
  });

  // console.log("filterBy", filterBy);

  filterBy.forEach((element) => {
    newFilterBy[element.attribute] = element.value;
  });

  for (let index = 0; index < filterBy.length; index++) {
    const element = filterBy[index];
    const resourceSpecFilter = resourceSpec.filterBy[element.attribute];

    if (resourceSpecFilter) {
      const transformations = resourceSpecFilter.transformations;

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

        console.log("resourceSpecFilter", resourceSpecFilter);

        let whereClause = {};
        whereClause["op"] = "in";
        whereClause["column"] = resourceSpecFilter.localKey;
        whereClause["value"] = transformedValue[element.attribute];
        filters.push(whereClause);
      } else {
        let whereClause = {};
        whereClause["op"] = "in";
        whereClause["column"] = resourceSpecFilter.localKey;
        whereClause["value"] = element.value;
        filters.push(whereClause);
      }
    }
  }

  mentalAction["filters"] = filters;
  context.mentalAction = mentalAction;

  return context;
};

module.exports = runTransformationsForFilters;
