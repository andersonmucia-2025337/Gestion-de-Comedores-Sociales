import * as mysql from "mysql2/promise";

export const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "IN4AM",
  password: process.env.DB_PASSWORD || "Kinal@2025AM",
  database: process.env.DB_NAME || "dbgestiondecomedoressociales_in5cm",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
