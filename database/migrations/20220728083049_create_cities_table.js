exports.up = async function (knex) {
  await knex.raw(`create extension if not exists "uuid-ossp"`);
  return knex.schema.createTable("cities", function (table) {
    table.uuid("uuid").notNullable().primary();
    table.string("name", 255);
    table.string("slug", 255);
    table.uuid("state_uuid");
    table.datetime("created_at");
    table.datetime("updated_at");
    table.datetime("deleted_at");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("cities");
};
