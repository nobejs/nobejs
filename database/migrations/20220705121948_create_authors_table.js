exports.up = async function (knex) {
  await knex.raw(`create extension if not exists "uuid-ossp"`);
  return knex.schema.createTable("authors", function (table) {
    table.uuid("uuid").notNullable().primary();
    table.string("name", 255);
    table.string("status", 255);
    table.uuid("team_uuid");
    table.datetime("published_at");
    table.datetime("created_at");
    table.datetime("updated_at");
    table.datetime("deleted_at");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("authors");
};
