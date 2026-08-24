const {Pool} = require("pg");

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "dev_tinder_postgres",
    password: "Postgres@123",
    port : 5432, 
})

module.exports = {pool};

