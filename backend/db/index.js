const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'nesianovel',
  waitForConnections: true,
  connectionLimit: 30,
  queueLimit: 100,
  connectTimeout: 10000,
};

const db = mysql.createPool(dbConfig);

module.exports = db;

