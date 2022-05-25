const findKeysFromRequest = requireUtil("findKeysFromRequest");
const validator = requireValidator();
const baseRepo = requireUtil("baseRepo");
var uuid = require("uuid");
const pickKeysFromObject = requireUtil("pickKeysFromObject");
const underscoredColumns = requireUtil("underscoredColumns");
const knex = requireKnex();

const prepareResult = (req, schema, operation) => {
  let keys = schema.map((s) => {
    return s.key;
  });

  if (operation === "index") {
    keys = [
      ...keys,
      ...["filters", "per_page", "page", "sort_order", "sort_column"],
    ];
    // console.log("keys", keys);
  }

  return findKeysFromRequest(req, keys);
};

const softOrHardDelete = (schema) => {
  const foundKey = schema.find((s) => {
    return s.key === "deleted_at";
  });

  return foundKey === undefined ? "hard" : "soft";
};

const keysForResult = (schema, operation) => {
  const keys = schema.filter((s) => {
    return s.includeInResult;
  });

  return keys.map((kop) => kop.key);
};

const validateInput = async (schema, payload, operation) => {
  const constraints = {};

  const keysWithRules = schema.filter((s) => {
    return s.rules && s.operations.length && s.operations.includes(operation);
  });

  for (let index = 0; index < keysWithRules.length; index++) {
    const element = keysWithRules[index];
    constraints[element.key] = element.rules;
  }

  return validator(payload, constraints);
};

const handleOperation = async (
  table,
  schema,
  payload,
  operation,
  where = {}
) => {
  if (operation === "store") {
    payload.uuid = uuid.v4();
    return await baseRepo.create(table, payload);
  }

  if (operation === "update") {
    return await baseRepo.update(table, { uuid: payload.uuid }, payload);
  }

  if (operation === "destroy") {
    await baseRepo.remove(
      table,
      { uuid: payload.uuid },
      softOrHardDelete(schema)
    );
  }

  if (operation === "show") {
    return await baseRepo.first(
      table,
      {
        uuid: payload.uuid,
      },
      true
    );
  }

  if (operation === "index") {
    const keys = keysForResult(schema, operation);
    const deletedAtColumn = `${table}.deleted_at`;

    let selectColumns = keys.map((k) => {
      return `${table}.${k}`;
    });

    selectColumns = underscoredColumns(selectColumns);

    let filters = JSON.parse(payload.filters || "{}");
    let filterKeys = Object.keys(filters);

    const per_page = payload.per_page || 10;
    const page = payload.page || 1;
    const sort_column = payload.sort_column || `${table}.updated_at`;
    const sort_order = payload.sort_order || "desc";

    try {
      let totalBuilder = knex(table).where(where).whereNull(deletedAtColumn);

      let dataBuilder = knex(table)
        .where({
          ...where,
        })
        .whereNull(deletedAtColumn);

      for (let i = 0; i < filterKeys.length; i++) {
        let filterKey = filterKeys[i];
        let filterValue = filters[filterKey];
        filterKey = filterKey.replace("*", ".");
        dataBuilder = dataBuilder.where(
          knex.raw(`LOWER(${filterKey})`),
          "LIKE",
          `%${filterValue}%`
        );
        totalBuilder = totalBuilder.where(
          knex.raw(`LOWER(${filterKey})`),
          "LIKE",
          `%${filterValue}%`
        );
      }

      let total = await totalBuilder.count({ count: "*" }).first();
      total = parseInt(total.count);

      let rows = await dataBuilder
        .orderBy(sort_column, sort_order)
        .select(selectColumns)
        .limit(per_page)
        .offset((page - 1) * per_page);

      return { data: rows, meta: { page, per_page, total } };
    } catch (error) {
      throw error;
    }
  }
};

const singleSerialize = (schema, payload, operation) => {
  const keys = keysForResult(schema, operation);
  return pickKeysFromObject(payload, keys);
};

const respond = (schema, payload, operation) => {
  if (operation === "store" || operation === "show" || operation === "update") {
    return singleSerialize(schema, payload, operation);
  }

  if (operation === "destroy") {
    return {
      message: "Successfully deleted",
    };
  }

  return payload;
};

module.exports = {
  prepareResult,
  validateInput,
  handleOperation,
  respond,
};
