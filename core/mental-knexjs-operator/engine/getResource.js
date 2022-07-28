const knex = requireKnex();
const pickKeysFromObject = requireUtil("pickKeysFromObject");
const { findPrimaryKey, getColumnsFromAttributes } = require("./helpers");

const getResource = async (resourceModels, resourceSpec, payload) => {
  let attributes = resourceSpec["attributes"];
  let table = resourceSpec["db_identifier"];

  let columns = getColumnsFromAttributes(resourceSpec);

  let relations = attributes.filter((c) => {
    return c.type === "relation";
  });

  let where = {
    uuid: payload.uuid,
  };

  const includes = payload.include.split(",");

  let appendable = {};

  for (let index = 0; index < includes.length; index++) {
    const element = includes[index];
    const relation = relations.find((r) => r.name === element);

    let localWhere = {};

    switch (relation.relation) {
      case "manyToMany":
        localWhere[relation.source_column] = payload.uuid;
        let pivotValues = await knex(relation.pivot_table)
          .where(localWhere)
          .select(relation.relations_column);

        pivotValues = pivotValues.map((p) => {
          return p[relation.relations_column];
        });

        let relationSpec = resourceModels[relation.resource];

        const primaryKey = findPrimaryKey(resourceModels[relation.resource]);

        let result = await knex(relationSpec.db_identifier)
          .whereIn(primaryKey, pivotValues)
          .select(getColumnsFromAttributes(relationSpec));

        console.log("result", result);

        appendable[relation.name] = result;

        break;

      default:
        break;
    }
  }

  let result = await knex(table)
    .where(where)
    .whereNull("deleted_at")
    .select(columns);

  result = result[0];

  return { ...result, ...appendable };
};

module.exports = getResource;
