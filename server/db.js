// server/db.js
import pkg from "pg";
import dotenv from "dotenv";
import path from "path";

dotenv.config();
dotenv.config({ path: path.resolve('./server/.env') }); // adjust path to where .env actually is

const { Pool } = pkg;

console.log(process.env.DATABASE_URL);

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
