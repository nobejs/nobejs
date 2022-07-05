const knex = requireKnex();

module.exports = async (dbOps) => {
  try {
    return await knex.transaction(async (trx) => {
      let opResult = {};

      for (let dbOpsCounter = 0; dbOpsCounter < dbOps.length; dbOpsCounter++) {
        const dbOp = dbOps[dbOpsCounter];

        console.log("dbOp", dbOp);

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

          case "get":
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
