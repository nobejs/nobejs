const knex = require("../database/knex");

afterAll(() => {
  knex.destroy();
});
