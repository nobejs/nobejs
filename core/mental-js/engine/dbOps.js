const knex = requireKnex();

module.exports = async (dbOps) => {
  try {
    return await knex.transaction(async (trx) => {
      let opResult = {};

      for (let dbOpsCounter = 0; dbOpsCounter < dbOps.length; dbOpsCounter++) {
        const dbOp = dbOps[dbOpsCounter];

        switch (dbOp.operation) {
          case "create":
            opResult = await trx(dbOp.table)
              .insert(dbOp.payload)
              .returning("*");
            break;

          case "update":
            opResult = await trx(dbOp.table)
              .where(dbOp.where)
              .update(dbOp.payload)
              .returning("*");
            break;

          case "delete":
            opResult = await trx(dbOp.table).where(dbOp.where).delete();
            break;

          case "get_first":
            opResult = await trx(dbOp.table)
              .where(dbOp.where)
              .select("*")
              .first();
            break;

          case "get":
            console.log("dbOp", dbOp);

            opResult = await trx(dbOp.table).where(dbOp.where).select("*");
            break;
        }
      }

      return opResult;
    });
  } catch (error) {
    throw error;
  }
};
