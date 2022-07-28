const Config = require("./config")();
const httpServer = requireHttpServer();
const path = require("path");
const mentalEngine = require("./core/mental-knexjs-operator/engine");
const mental = require("./core/mental-js/engine/index");
const baseRepo = requireUtil("baseRepo");
const knex = requireKnex();
const responseKey = Config["responseKey"];

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

          case "get":
            // console.log("dbOp", dbOp);

            const filters = dbOp.filters;
            let dataBuilder = trx(dbOp.table);
            let totalBuilder = trx(dbOp.table);

            for (let index = 0; index < filters.length; index++) {
              const filter = filters[index];
              switch (filter.op) {
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

const server = httpServer({});

mental.init({
  resourcesPath: path.resolve(`mental/resources`),
  apiPrefix: "/mental-js",
  operator: dbOps,
});

mental.resolvePayload(async (mentalRoute, frameworkData) => {
  return frameworkData.reqBody;
});

mental.resolveUser(async (mentalRoute, frameworkData) => {
  return "*";
});

mental.checkBack(async (mentalAction, event) => {
  return mentalAction;
});

mental.addFunction("uniqueForAuthor", async (payload) => {
  console.log("I am custom validator", payload);
  return true;
});

const routes = mental.generateRoutes();

routes.forEach((mentalRoute) => {
  server[mentalRoute.method](mentalRoute.path, async (req, res, next) => {
    let result = await mental.executeRoute(mentalRoute, {
      reqBody: req.body,
      reqParams: req.params,
      reqQuery: req.query,
      reqHeaders: req.Headers,
    });
    return res.code(200).send(result[responseKey]);
  });
});

server.listen(
  { port: process.env.PORT || 3000, host: "0.0.0.0" },
  (err, address) => {
    if (err) {
      console.log(err);
      process.exit(1);
    }
  }
);
