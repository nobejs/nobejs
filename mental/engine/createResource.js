const knex = requireKnex();
const pickKeysFromObject = requireUtil("pickKeysFromObject");
const { augmentWithBelongsTo, augmentWithManyToMany } = require("./helpers");

const createResource = async (resourceModels, resourceSpec, payload) => {
  let attributes = resourceSpec["attributes"];
  let table = resourceSpec["sql_table"];

  let columns = attributes
    .filter((c) => {
      return c.type !== "relation";
    })
    .map((c) => {
      return `${c.name}`;
    });

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

  // console.log("dbOps", dbOps);

  let result = await knex.transaction(async (trx) => {
    const rows = await trx(table).insert(dbRecord).returning("*");
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
          console.log("pivotPauload", pivotPayload);
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

module.exports = createResource;
