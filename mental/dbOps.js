const knex = requireKnex();

const dbOps = async (dbOps) => {
  // console.log("server - run - dbops", dbOps);

  try {
    return await knex.transaction(async (trx) => {
      let opResult = {};

      for (let dbOpsCounter = 0; dbOpsCounter < dbOps.length; dbOpsCounter++) {
        const dbOp = dbOps[dbOpsCounter];
        dbOp["table"] = dbOp.resourceSpec.meta.table;

        switch (dbOp.operation) {
          case "insert":
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

          case "select_first":
            opResult = await trx(dbOp.table)
              .where(dbOp.where)
              .select("*")
              .first();
            break;

          case "select":
            // console.log("dbOp", dbOp);

            const filters = dbOp.filters;
            let dataBuilder = trx(dbOp.table).whereNull("deleted_at");
            let totalBuilder = trx(dbOp.table).whereNull("deleted_at");

            for (let index = 0; index < filters.length; index++) {
              const filter = filters[index];
              switch (filter.op.toLowerCase()) {
                case "like":
                  dataBuilder = dataBuilder.where(
                    filter.column,
                    "LIKE",
                    `%${filter.value}%`
                  );
                  totalBuilder = totalBuilder.where(
                    filter.column,
                    "LIKE",
                    `%${filter.value}%`
                  );
                  break;

                case "gte":
                  dataBuilder = dataBuilder.where(
                    filter.column,
                    ">=",
                    `${filter.value}`
                  );
                  totalBuilder = totalBuilder.where(
                    filter.column,
                    ">=",
                    `${filter.value}`
                  );
                  break;

                case "eq":
                  dataBuilder = dataBuilder.where(
                    filter.column,
                    "=",
                    `${filter.value}`
                  );
                  totalBuilder = totalBuilder.where(
                    filter.column,
                    "=",
                    `${filter.value}`
                  );
                  break;

                default:
                  break;
              }
            }

            let dataResult = await dataBuilder
              .orderBy(dbOp.sortBy)
              .select(dbOp.selectColumns)
              .limit(dbOp.limit)
              .offset(dbOp.offset);

            let totalResult = await totalBuilder.count({ count: "*" }).first();
            let total = parseInt(totalResult.count);

            return { data: dataResult, total: total };

            break;
        }
      }

      return opResult;
    });
  } catch (error) {
    console.log("error", error);
    throw error;
  }
};

module.exports = dbOps;
