exports.up = function (knex) {
  return knex.schema.alterTable("posts", function (table) {
    table.uuid("author_uuid");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("posts", function (table) {
    table.dropColumn("author_uuid");
  });
};
