exports.up = async function (knex) {
  await knex.raw(`create extension if not exists "uuid-ossp"`);
  return knex.schema.createTable("category_posts", function (table) {
    table.uuid("category_uuid");
    table.uuid("post_uuid");
    table.datetime("created_at");
    table.datetime("updated_at");
    table.datetime("deleted_at");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("categories");
};
