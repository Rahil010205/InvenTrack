import mysql from "mysql2/promise";

export const db = await mysql.createConnection({
  host: "localhost",
  user: "root",
  password: process.env.DB_PASSWORD,
  database: "stockmaster",
  timezone: "+05:30" // forces UTC timestamps (recommended)
});
