exports.up = async function (knex) {
  await knex.raw(`create extension if not exists "uuid-ossp"`);
  return knex.schema.createTable("posts", function (table) {
    table.uuid("uuid").notNullable().primary();
    table.string("title", 255);
    table.text("body");
    table.jsonb("meta");
    table.uuid("author_uuid");
    table.uuid("team_uuid");
    table.datetime("published_at");
    table.datetime("created_at");
    table.datetime("updated_at");
    table.datetime("deleted_at");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("posts");
};
