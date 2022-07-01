const knex = requireKnex();
const pickKeysFromObject = requireUtil("pickKeysFromObject");
const { augmentWithBelongsTo, augmentWithManyToMany } = require("./helpers");

const updateResource = async (resourceModels, resourceSpec, payload) => {
  let attributes = resourceSpec["attributes"];
  let table = resourceSpec["sql_table"];

  let columns = getColumnsFromAttributes(resourceSpec);

  let dbRecord = pickKeysFromObject(payload, columns);

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

  let result = await knex.transaction(async (trx) => {
    const rows = await trx(table)
      .where({
        uuid: payload.uuid,
      })
      .whereNull("deleted_at")
      .update(dbRecord)
      .returning("*");
    let mainResource = rows[0];

    for (let dbOpsCounter = 0; dbOpsCounter < dbOps.length; dbOpsCounter++) {
      const dbOp = dbOps[dbOpsCounter];

      let pivotPayload = {};

      switch (dbOp.operation) {
        case "truncate":
          pivotPayload[dbOp.source_column] = mainResource.uuid;
          await knex(dbOp.pivot_table).where(pivotPayload).del();
          break;

        case "create_many_to_many_resource":
          let createdResource = await trx(dbOp.table)
            .insert(dbOp.payload)
            .returning("*");
          createdResource = createdResource[0];
          pivotPayload = {};
          pivotPayload[dbOp.source_column] = mainResource.uuid;
          pivotPayload[dbOp.relations_column] =
            createdResource[dbOp["primaryKey"]];
          await trx(dbOp.pivot_table).insert(pivotPayload).returning("*");
          break;

        case "create_pivot":
          pivotPayload = dbOp.payload;
          pivotPayload[dbOp.source_column] = mainResource.uuid;
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

module.exports = updateResource;
