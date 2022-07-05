const knex = requireKnex();
const pickKeysFromObject = requireUtil("pickKeysFromObject");
const {
  augmentWithBelongsTo,
  augmentWithManyToMany,
  findPrimaryKey,
  getColumnsFromAttributes,
} = require("./helpers");

const createResource = async (resourceModels, resource, payload) => {
  let resourceSpec = resourceModels[resource];
  let attributes = resourceSpec["attributes"];
  let table = resourceSpec["sql_table"];
  let columns = getColumnsFromAttributes(resourceSpec);
  let dbRecord = pickKeysFromObject(payload, columns);
  const resourcePrimaryKey = findPrimaryKey(resourceSpec);

  dbRecord = augmentWithBelongsTo(
    dbRecord,
    payload,
    attributes,
    resourceModels
  );

  const dbOps = augmentWithManyToMany(
    dbRecord,
    payload,
    attributes,
    resourceModels
  );

  // Engine shoould generation db operations to run, and should leave framework to implement those dbOps it's own way

  // console.log("dbOps", dbOps);

  let result = await knex.transaction(async (trx) => {
    const rows = await trx(table).insert(dbRecord).returning("*");
    let mainResource = rows[0];
    const createdResourceId = mainResource[resourcePrimaryKey];

    for (let dbOpsCounter = 0; dbOpsCounter < dbOps.length; dbOpsCounter++) {
      const dbOp = dbOps[dbOpsCounter];

      let pivotPayload = {};

      switch (dbOp.operation) {
        case "truncate":
          pivotPayload[dbOp.source_column] = createdResourceId;
          await knex(dbOp.pivot_table).where(pivotPayload).del();
          break;

        case "create_many_to_many_resource":
          let createdResource = await trx(dbOp.table)
            .insert(dbOp.payload)
            .returning("*");
          createdResource = createdResource[0];
          pivotPayload = {};
          pivotPayload[dbOp.source_column] = createdResourceId;
          pivotPayload[dbOp.relations_column] =
            createdResource[dbOp["relationsPrimaryKey"]];
          console.log("pivotPauload", pivotPayload);
          await trx(dbOp.pivot_table).insert(pivotPayload).returning("*");
          break;

        case "create_pivot":
          pivotPayload = dbOp.payload;
          pivotPayload[dbOp.source_column] = createdResourceId;
          await trx(dbOp.table).insert(pivotPayload).returning("*");
          break;

        default:
          break;
      }
    }

    return mainResource;
  });

  return result;
};

module.exports = createResource;
