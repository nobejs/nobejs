exports.up = async function (knex) {
  await knex.raw(`create extension if not exists "uuid-ossp"`);
  return knex.schema.createTable("teams", function (table) {
    table.uuid("uuid").notNullable().primary();
    table.string("title", 255);
    table.jsonb("meta");
    table.datetime("created_at");
    table.datetime("updated_at");
    table.datetime("deleted_at");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("teams");
};
