const config = require("./index");

module.exports = {
  development: {
    storage: config.dbFile, // specifies SQlite db file
    dialect: "sqlite", // uses SQLite as db dialect
    seederStorage: "sequelize", // tracks seed file executed
    logQueryParameters: true, // enables logging of query parameters
    typeValidation: true, // validates datatypes before querying the db
  },
  production: {
    use_env_variable: 'DATABASE_URL', // db connection string from enviroment variable
    dialect: "postgres", // use PostgreSQL as the database dialect
    seederStorage: "sequelize", // tracks seed file executed by Sequelize
    dialectOptions: {
      ssl: {
        require: true, // requires SSL connection
        rejectUnauthorized: false, // ignores SSL certifcate validation errors
      },
    },
    define: {
      schema: process.env.SCHEMA, // sets schema from enviroment variable for PostgreSQL
    },
  },
};