require("../config");

async function dropTestDatabase() {
  const knex = require("knex")({
    client: "pg",
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      application_name: process.env.APP_NAME || "nobe-runner",
      timezone: "utc",
    },
  });
  try {
    await knex.raw(`DROP DATABASE IF EXISTS ${process.env.DB_NAME}`);
  } catch (error) {
    throw new Error(error);
  } finally {
    await knex.destroy();
  }
}

module.exports = async () => {
  try {
    await dropTestDatabase();
    console.log("Test database dropped successfully");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
