const knex = requireKnex();

const addCreatedTimestamps = (payload) => {
  if (process.env.DB_DIALECT === "pg") {
    payload["created_at"] = new Date().toISOString();
    payload["updated_at"] = new Date().toISOString();
  }
  return payload;
};

const create = async (table, payload) => {
  try {
    payload = addCreatedTimestamps(payload);
    let result = await knex.transaction(async (trx) => {
      if (process.env.DB_DIALECT === "pg") {
        const rows = await trx(table).insert(payload).returning("*");
        return rows[0];
      } else {
        const rows = await trx(table).insert(payload);
        return rows[0];
      }
    });
    return result;
  } catch (error) {
    throw error;
  }
};

const update = async (table, where, payload) => {
  try {
    if (process.env.DB_DIALECT === "pg") {
      payload["updated_at"] = new Date().toISOString();
      let rows = await knex(table)
        .where(where)
        .whereNull("deleted_at")
        .update(payload)
        .returning("*");
      return rows[0];
    } else {
      let rows = await knex(table)
        .where(where)
        .whereNull("deleted_at")
        .update(payload);

      return rows[0];
    }
  } catch (error) {
    throw error;
  }
};

const remove = async (table, where, mode = "soft") => {
  try {
    if (mode === "soft") {
      let payload = {};

      if (process.env.DB_DIALECT === "pg") {
        payload = {
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      } else {
        payload = {
          deleted_at: knex.fn.now(),
        };
      }

      let row = await knex(table).where(where).update(payload);

      return row;
    }

    if (mode === "hard") {
      let rows = await knex(table).where(where).delete();
      return rows;
    }
  } catch (error) {
    throw error;
  }
};

const first = async (table, where = {}, throwNotFound = false) => {
  try {
    let row = await knex(table).where(where).whereNull("deleted_at").first();

    if (throwNotFound) {
      if (row === undefined) {
        throw {
          errorCode: "NotFound",
          statusCode: 404,
          message: "Not Found",
        };
      }
    }

    return row;
  } catch (error) {
    throw {
      statusCode: 404,
      message: "Not Found",
    };
  }
};

const countAll = async (table, where = {}, whereNot = {}) => {
  try {
    let rows = await knex(table)
      .where(where)
      .whereNot(whereNot)
      .whereNull("deleted_at")
      .count({ count: "*" })
      .first();
    return parseInt(rows.count);
  } catch (error) {
    throw error;
  }
};

const findAll = async (table, where = {}, columns = "*") => {
  try {
    let rows = await knex(table)
      .where(where)
      .whereNull("deleted_at")
      .select(columns);
    return rows;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  addCreatedTimestamps,
  create,
  remove,
  update,
  first,
  findAll,
  countAll,
  knex,
};
