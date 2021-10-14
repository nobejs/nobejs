require("./config");

module.exports = {
  client: "pg",
  debug: false,
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    application_name: process.env.APP_NAME || "nobe-runner",
  },
  migrations: {
    directory: "./database/migrations",
    tableName: "migrations",
  },
};
