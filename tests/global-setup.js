require("../config");

async function createTestDatabase() {
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
    if (process.env.GITHUB_ACTIONS) {
      console.log("No need to create/drop db, as container would be destroyed");
    } else {
      await knex.raw(`DROP DATABASE IF EXISTS ${process.env.DB_NAME}`);
      await knex.raw(`CREATE DATABASE ${process.env.DB_NAME}`);
    }
  } catch (error) {
    throw new Error(error);
  } finally {
    await knex.destroy();
  }
}

async function migrateTestDatabase() {
  const knex = require("knex")({
    client: "pg",
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      application_name: process.env.APP_NAME || "nobe-runner",
      timezone: "utc",
    },
    migrations: {
      directory: "./database/migrations",
      tableName: "migrations",
    },
  });

  try {
    await knex.raw(`create extension if not exists "uuid-ossp"`);
    await knex.migrate.latest();
  } catch (error) {
    throw new Error(error);
  } finally {
    await knex.destroy();
  }
}

module.exports = async () => {
  try {
    await createTestDatabase();
    await migrateTestDatabase();
    console.log("Test database created successfully and migrated");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
