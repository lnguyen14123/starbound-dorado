// server/api.js
import express from "express";
import { pool } from "./db.js";

const router = express.Router();


router.post("/users", async (req, res) => {
  const { uid, email, username } = req.body;
  try {
    await pool.query(
      "INSERT INTO users (uid, email, username) VALUES ($1, $2, $3)",
      [uid, email, username]
    );
    res.status(201).json({ message: "User created" });
  } catch (err) {
    console.error("Error inserting user:", err);
    res.status(500).json({ error: "Database error" });
  }
});
  


export default router;
