exports.up = function (knex) {
  return knex.schema.createTable("categories", function (table) {
    table
      .uuid("uuid")
      .notNullable()
      .primary()
      .defaultTo(knex.raw("uuid_generate_v4()"));
    table.uuid("user_uuid").notNullable();
    table.string("name", 255).notNullable();
    table.datetime("created_at", { useTz: false });
    table.datetime("updated_at", { useTz: false });
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("categories");
};
