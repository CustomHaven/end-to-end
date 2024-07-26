const { Pool } = require("pg");

// Connect to the db - require a DB-URL value to have been loaded into the environment

const db = new Pool({
  connectionString: process.env.DB_URL
});


module.exports = db;