const { Pool } = require("pg");

const pool = new Pool({
    host: process.env.DB_HOST || "db_fornecedores",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "fornecedores_db",
    port: process.env.DB_PORT || 5432
});

module.exports = pool;