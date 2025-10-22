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
  
router.post("/choosePet", async (req, res) => {
  const { uid, petType } = req.body;
  
  try {
    await pool.query(
      "UPDATE users SET pet_type = $1 WHERE uid = $2",
      [petType, uid]
    );
    console.log(petType);
    res.status(200).json({ message: "Pet choice saved successfully" });

  } catch (err) {
    console.error("Error updating pet type:", err);
    res.status(500).json({ error: "Database error" });
  }
});

router.post("/user/pet", async (req, res) => {
  const { uid } = req.body;  // just send uid

  if (!uid) return res.status(400).json({ error: "Missing UID" });

  try {
    const result = await pool.query(
      "SELECT pet_type FROM users WHERE uid = $1",
      [uid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ petType: result.rows[0].pet_type });
  } catch (err) {
    console.error("Error fetching pet type:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Task CRUD api routes
router.get("/tasks/:uid", async (req, res) => {
  const { uid } = req.params;
  
  try {
    const result = await pool.query(
      "SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC",
      [uid]
    );
    res.status(200).json({ tasks: result.rows });
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ error: "Database error" });
  }
});

router.post("/tasks", async (req, res) => {
  const { 
    user_id, 
    title, 
    description, 
    priority = 'Medium', 
    class: taskClass, 
    type, 
    start_date, 
    due_date, 
    reminder, 
    custom_filter 
  } = req.body;
  
  try {
    const result = await pool.query(
      `INSERT INTO tasks (user_id, title, description, priority, class, type, start_date, due_date, reminder, custom_filter) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING *`,
      [user_id, title, description, priority, taskClass, type, start_date, due_date, reminder, custom_filter]
    );
    res.status(201).json({ task: result.rows[0] });
  } catch (err) {
    console.error("Error creating task:", err);
    res.status(500).json({ error: "Database error" });
  }
});

router.put("/tasks/:taskId", async (req, res) => {
  const { taskId } = req.params;
  const { 
    title, 
    description, 
    priority, 
    class: taskClass, 
    type, 
    start_date, 
    due_date, 
    reminder, 
    is_completed, 
    custom_filter 
  } = req.body;
  
  try {
    const result = await pool.query(
      `UPDATE tasks 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           priority = COALESCE($3, priority),
           class = COALESCE($4, class),
           type = COALESCE($5, type),
           start_date = COALESCE($6, start_date),
           due_date = COALESCE($7, due_date),
           reminder = COALESCE($8, reminder),
           is_completed = COALESCE($9, is_completed),
           custom_filter = COALESCE($10, custom_filter),
           updated_at = CURRENT_TIMESTAMP
       WHERE task_id = $11 
       RETURNING *`,
      [title, description, priority, taskClass, type, start_date, due_date, reminder, is_completed, custom_filter, taskId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }
    
    res.status(200).json({ task: result.rows[0] });
  } catch (err) {
    console.error("Error updating task:", err);
    res.status(500).json({ error: "Database error" });
  }
});

router.delete("/tasks/:taskId", async (req, res) => {
  const { taskId } = req.params;
  
  try {
    const result = await pool.query(
      "DELETE FROM tasks WHERE task_id = $1 RETURNING *",
      [taskId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }
    
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(500).json({ error: "Database error" });
  }
});

export default router;
