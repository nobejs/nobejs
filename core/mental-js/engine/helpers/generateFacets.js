const runTransformation = require("../helpers/runTransformation");

const generateFacets = async (context) => {
  const { mentalAction, resourceModels, mentalConfig } = context;

  if (context.mentalAction["opResult"]["generated_facets"] !== undefined) {
    const facets = {};

    const resourceSpec = resourceModels[mentalAction.resource];
    const attributes = resourceSpec.attributes;
    let generatedFacets = context.mentalAction["opResult"]["generated_facets"];

    let facetAttributes = resourceSpec.attributes.filter((c) => {
      return c.facet;
    });

    for (let tIndex = 0; tIndex < facetAttributes.length; tIndex++) {
      const facetAttribute = facetAttributes[tIndex];
      const tag = facetAttribute["facet"]["tag"];
      const valueKey = facetAttribute["facet"]["value"];
      const resource = facetAttribute["facet"]["resource"];

      const valueAndCountMap = {};

      const filteredByTag = generatedFacets
        .filter((g) => {
          return g.attr === tag;
        })
        .map((g) => {
          valueAndCountMap[g.value] = g.count;
          return g.value;
        });

      //   console.log(
      //     "facetAttribute",
      //     facetAttribute.identifier,
      //     filteredByTag,
      //   );

      if (resource !== undefined) {
        const resourceSpec = resourceModels[resource];

        let whereClause = {};
        whereClause["op"] = "in";
        whereClause["column"] = valueKey;
        whereClause["value"] = filteredByTag;

        // console.log("relation based", resource, whereClause, resourceSpec);

        let operations = [];

        operations.push({
          resourceSpec: resourceSpec,
          operation: "select",
          filters: [whereClause],
          selectColumns: "*",
        });

        let generatedData = await mentalConfig.operator(operations);
        generatedData = generatedData["data"];
        // console.log("generatedData", generatedData);

        for (let gIndex = 0; gIndex < generatedData.length; gIndex++) {
          const generatedItem = generatedData[gIndex];
          generatedItem["count"] = valueAndCountMap[generatedItem[valueKey]];
        }

        facets[tag] = generatedData;
      }
    }

    delete context.mentalAction["opResult"]["generated_facets"];
    context.mentalAction["opResult"]["facets"] = facets;
  }

  return context;
};

module.exports = generateFacets;
