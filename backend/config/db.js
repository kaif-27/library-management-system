const mysql = require('mysql2');
require('dotenv').config({ override: true });

let host = process.env.DB_HOST || 'localhost';
if (process.platform === 'win32' && host === 'mysql') {
  host = 'localhost';
}

const db = mysql.createPool({
  host: host,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',
  database: process.env.DB_NAME || 'library_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

db.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection pool failed:', err.message);
    return;
  }
  console.log(`MySQL Pool Connected Successfully! (Host: ${host}, DB: ${process.env.DB_NAME || 'library_db'})`);
  connection.release();
});

module.exports = db;