exports.up = async function (knex) {
  await knex.raw(`create extension if not exists "uuid-ossp"`);
  return knex.schema.createTable("states", function (table) {
    table.uuid("uuid").notNullable().primary();
    table.string("name", 255);
    table.string("slug", 255);
    table.datetime("created_at");
    table.datetime("updated_at");
    table.datetime("deleted_at");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("states");
};
