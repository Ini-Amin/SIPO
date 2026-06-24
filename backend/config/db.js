const mysql = require("mysql2/promise");
require("dotenv").config();

const dbConfig = process.env.DATABASE_URL
  ? process.env.DATABASE_URL
  : {
      host: process.env.DB_HOST || "127.0.0.1",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "sipo_db",
      port: process.env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    };

const pool = typeof dbConfig === "string"
  ? mysql.createPool({
      uri: dbConfig,
      ssl: {
        rejectUnauthorized: false,
      },
    })
  : mysql.createPool(dbConfig);

module.exports = pool;
