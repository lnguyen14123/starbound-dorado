// server/api.js
import express from "express";
import { pool } from "./db.js";

const router = express.Router();

const ITEM_CATEGORIES = ["hat", "collar", "breed", "wall", "floor", "decor"];

const DEFAULT_PET_SLOTS = {
  hat_item: null,
  collar_item: null,
  breed_item: null,
};

const DEFAULT_ROOM_SLOTS = {
  wall_item: null,
  floor_item: null,
  decor_item: null,
};

const SLOT_CONFIG = {
  pet: {
    table: "equipped_pet_slots",
    columns: Object.keys(DEFAULT_PET_SLOTS),
    validCategories: ["hat", "collar", "breed"],
  },
  room: {
    table: "equipped_room_slots",
    columns: Object.keys(DEFAULT_ROOM_SLOTS),
    validCategories: ["wall", "floor", "decor"],
  },
};

const buildEquippedResponse = (petRow = {}, roomRow = {}) => ({
  pet: { ...DEFAULT_PET_SLOTS, ...petRow },
  room: { ...DEFAULT_ROOM_SLOTS, ...roomRow },
});

async function getEquippedSlots(uid) {
  const [petResult, roomResult] = await Promise.all([
    pool.query(
      `SELECT ${SLOT_CONFIG.pet.columns.join(", ")} FROM ${SLOT_CONFIG.pet.table} WHERE uid = $1`,
      [uid]
    ),
    pool.query(
      `SELECT ${SLOT_CONFIG.room.columns.join(", ")} FROM ${SLOT_CONFIG.room.table} WHERE uid = $1`,
      [uid]
    ),
  ]);

  return buildEquippedResponse(petResult.rows[0], roomResult.rows[0]);
}

async function seedStarterInventory(uid) {
  try {
    const result = await pool.query(
      `INSERT INTO inventory_items (uid, item_id)
       SELECT $1, starter.item_id
       FROM (
         SELECT DISTINCT ON (category) item_id
         FROM items
         WHERE category = ANY($2::text[])
         ORDER BY category, created_at ASC
       ) AS starter
       ON CONFLICT (uid, item_id) DO NOTHING`,
      [uid, ITEM_CATEGORIES]
    );

    return result.rowCount > 0;
  } catch (err) {
    if (err.code === "42P01") {
      return false;
    }
    throw err;
  }
}


router.post("/users", async (req, res) => {
  const { uid, email, username } = req.body;
  
  if (!uid || !email || !username) {
    return res.status(400).json({ error: "Missing required fields: uid, email, or username" });
  }

  try {
    await pool.query(
      "INSERT INTO users (uid, email, username) VALUES ($1, $2, $3)",
      [uid, email, username]
    );
    res.status(201).json({ message: "User created" });
  } catch (err) {
    
    if (err.code === '23505') { 
      try {
        await pool.query(
          "UPDATE users SET email = $1, username = $2 WHERE uid = $3",
          [email, username, uid]
        );
        res.status(200).json({ message: "User updated" });
      } catch (updateErr) {
        res.status(500).json({ error: "Database error" });
      }
    } else {
      res.status(500).json({ error: "Database error", details: err.message });
    }
  }
});
  
router.post("/choosePet", async (req, res) => {
  const { uid, petType } = req.body;

  console.log(req.body)
  
  try {
    await pool.query(
      "UPDATE users SET pet_type = $1 WHERE uid = $2",
      [petType, uid]
    );

    res.status(200).json({ message: "Pet choice saved successfully" });

  } catch (err) {

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

    res.status(500).json({ error: "Database error" });
  }
});

// Task CRUD api routes
router.post("/tasks", async (req, res) => {
  const { uid, name, date, priority, difficulty} = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO tasks (user_id, title, priority, due_date, difficulty) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [uid, name, priority, date, difficulty]
    );
    res.status(201).json({ task: result.rows[0] });
  } catch (err) {

    res.status(500).json({ error: "Database error" });
  }
});

router.get("/tasks", async (req, res) => {
  const { uid } = req.query;
  try {
    const result = await pool.query(
      `SELECT * FROM tasks WHERE user_id = $1 ORDER BY due_date ASC`,
      [uid]
    );
    res.json({ tasks: result.rows });
  } catch (err) {

    res.status(500).json({ error: "Database error" });
  }
});

router.post("/tasks/delete", async (req, res) => {
  const { uid, taskIds } = req.body;

  if (!taskIds || taskIds.length === 0) {
    return res.status(400).json({ error: "No tasks to delete" });
  }



  try {

    const placeholders = taskIds.map((_, i) => `$${i + 2}`).join(", ");
    const query = `DELETE FROM tasks WHERE user_id = $1 AND task_id IN (${placeholders})`;

    await pool.query(query, [uid, ...taskIds]);

    res.json({ success: true });
  } catch (err) {

    res.status(500).json({ error: "Failed to delete tasks" });
  }
});

// Friends API routes
router.get("/users/all", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT uid, email, username FROM users ORDER BY username`
    );
    res.json({ users: result.rows, count: result.rows.length });
  } catch (err) {
    res.status(500).json({ error: "Database error", details: err.message });
  }
});

// Search users by username
router.get("/users/search", async (req, res) => {
  const { username, currentUid } = req.query;

  if (!username || !currentUid) {
    return res.status(400).json({ error: "Missing username or currentUid" });
  }

  try {
    // Search for users by username
    const result = await pool.query(
      `SELECT uid, email, username 
       FROM users 
       WHERE username IS NOT NULL 
       AND username != '' 
       AND username ILIKE $1 
       AND uid != $2 
       LIMIT 10`,
      [`%${username}%`, currentUid]
    );

    res.json({ users: result.rows });
  } catch (err) {
    res.status(500).json({ error: "Database error", details: err.message });
  }
});

// Send friend request 
router.post("/friends/request", async (req, res) => {
  const { senderUid, receiverUid } = req.body;

  if (!senderUid || !receiverUid) {
    return res.status(400).json({ error: "Missing senderUid or receiverUid" });
  }

  if (senderUid === receiverUid) {
    return res.status(400).json({ error: "Cannot add yourself as a friend" });
  }

  try {
    const user1 = senderUid < receiverUid ? senderUid : receiverUid;
    const user2 = senderUid < receiverUid ? receiverUid : senderUid;

    // Checks if friendship already exists
    const existing = await pool.query(
      `SELECT friendship_id FROM friendships 
       WHERE user1_uid = $1 AND user2_uid = $2`,
      [user1, user2]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "Friendship already exists" });
    }

    // Check if there's already a friend request between these users
    const existingRequest = await pool.query(
      `SELECT request_id, status FROM friend_requests 
       WHERE sender_uid = $1 AND receiver_uid = $2`,
      [senderUid, receiverUid]
    );

    if (existingRequest.rows.length > 0) {
      const request = existingRequest.rows[0];
      if (request.status === 'pending') {
        return res.status(400).json({ error: "Friend request already sent" });
      } else if (request.status === 'accepted') {
        return res.status(400).json({ error: "You are already friends with this user" });
      } else {
        return res.status(400).json({ error: "Friend request was previously declined" });
      }
    }

    // Verify both users exist
    const usersCheck = await pool.query(
      `SELECT uid FROM users WHERE uid IN ($1, $2)`,
      [senderUid, receiverUid]
    );

    if (usersCheck.rows.length !== 2) {
      return res.status(404).json({ error: "One or both users not found" });
    }

    // Create friend request
    const result = await pool.query(
      `INSERT INTO friend_requests (sender_uid, receiver_uid, status) 
       VALUES ($1, $2, 'pending')
       RETURNING request_id`,
      [senderUid, receiverUid]
    );

    res.status(201).json({ 
      message: "Friend request sent successfully",
      requestId: result.rows[0].request_id
    });
  } catch (err) {
    // Handle specific database errors
    if (err.code === '42P01') { // Table doesn't exist
      return res.status(500).json({ 
        error: "Friend requests table not found. Please create the friend_requests table in your database." 
      });
    } else if (err.code === '23505') { // Unique violation
      return res.status(400).json({ error: "Friend request already exists between these users" });
    } else if (err.code === '23503') { // Foreign key violation
      return res.status(404).json({ error: "One or both users not found" });
    } else {
      // Don't fall back to direct friendship - return the error
      return res.status(500).json({ 
        error: "Database error", 
        details: err.message 
      });
    }
  }
});

// Get list of friends for a user
router.get("/friends/:uid", async (req, res) => {
  const { uid } = req.params;

  if (!uid) {
    return res.status(400).json({ error: "Missing uid" });
  }

  try {
    // Get all friendships where the user is either user1 or user2
    const result = await pool.query(
      `SELECT 
        CASE 
          WHEN f.user1_uid = $1 THEN f.user2_uid
          ELSE f.user1_uid
        END as friend_uid,
        CASE 
          WHEN f.user1_uid = $1 THEN u2.username
          ELSE u1.username
        END as username,
        CASE 
          WHEN f.user1_uid = $1 THEN u2.email
          ELSE u1.email
        END as email
       FROM friendships f
       LEFT JOIN users u1 ON f.user1_uid = u1.uid
       LEFT JOIN users u2 ON f.user2_uid = u2.uid
       WHERE f.user1_uid = $1 OR f.user2_uid = $1
       ORDER BY f.created_at DESC`,
      [uid]
    );

    res.json({ friends: result.rows });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// Get  friend requests for a user
router.get("/friends/requests/:uid", async (req, res) => {
  const { uid } = req.params;

  if (!uid) {
    return res.status(400).json({ error: "Missing uid" });
  }

  try {
    // Get all  friend requests where the user is the receiver
    const result = await pool.query(
      `SELECT 
        fr.request_id,
        fr.sender_uid,
        fr.receiver_uid,
        fr.status,
        fr.created_at,
        u.uid,
        u.username,
        u.email
       FROM friend_requests fr
       LEFT JOIN users u ON fr.sender_uid = u.uid
       WHERE fr.receiver_uid = $1 AND fr.status = 'pending'
       ORDER BY fr.created_at DESC`,
      [uid]
    );

    res.json({ requests: result.rows });
  } catch (err) {
    // If friend_requests table doesn't exist, return empty array
    if (err.code === '42P01') {
      res.json({ requests: [] });
    } else {
      res.status(500).json({ error: "Database error" });
    }
  }
});

// Handle friend request response (accept/decline)
router.put("/friends/requests/:requestId", async (req, res) => {
  const { requestId } = req.params;
  const { status, uid } = req.body; // status should be 'accepted' or 'declined'

  if (!requestId || !status || !uid) {
    return res.status(400).json({ error: "Missing requestId, status, or uid" });
  }

  if (status !== 'accepted' && status !== 'declined') {
    return res.status(400).json({ error: "Status must be 'accepted' or 'declined'" });
  }

  try {
    // Get the friend request
    const requestResult = await pool.query(
      `SELECT sender_uid, receiver_uid, status 
       FROM friend_requests 
       WHERE request_id = $1`,
      [requestId]
    );

    if (requestResult.rows.length === 0) {
      return res.status(404).json({ error: "Friend request not found" });
    }

    const request = requestResult.rows[0];

    // Verify the user is the receiver
    if (request.receiver_uid !== uid) {
      return res.status(403).json({ error: "You can only respond to your own friend requests" });
    }

    // Verify the request is still pending
    if (request.status !== 'pending') {
      return res.status(400).json({ error: "Friend request has already been processed" });
    }

    // Update the friend request status
    await pool.query(
      `UPDATE friend_requests 
       SET status = $1 
       WHERE request_id = $2`,
      [status, requestId]
    );

    // If accepted, create the friendship
    if (status === 'accepted') {
      const senderUid = request.sender_uid;
      const receiverUid = request.receiver_uid;
      
      // Ensure user1_uid < user2_uid for the CHECK constraint
      const user1 = senderUid < receiverUid ? senderUid : receiverUid;
      const user2 = senderUid < receiverUid ? receiverUid : senderUid;

      // Check if friendship already exists (shouldn't happen, but just in case)
      const existing = await pool.query(
        `SELECT friendship_id FROM friendships 
         WHERE user1_uid = $1 AND user2_uid = $2`,
        [user1, user2]
      );

      if (existing.rows.length === 0) {
        await pool.query(
          `INSERT INTO friendships (user1_uid, user2_uid) 
           VALUES ($1, $2)`,
          [user1, user2]
        );
      }
    }

    res.json({ message: `Friend request ${status}` });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});


router.get("/inventory/catalog", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT item_id, category, display_name, asset_path, created_at 
       FROM items
       ORDER BY category, display_name`
    );
    res.json({ items: result.rows });
  } catch (err) {
    if (err.code === "42P01") {
      return res.json({ items: [] });
    }
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/inventory/:uid", async (req, res) => {
  const { uid } = req.params;

  if (!uid) {
    return res.status(400).json({ error: "Missing uid" });
  }

  try {
    const inventoryQuery = `SELECT 
        ii.item_id,
        ii.acquired_at,
        i.category,
        i.display_name,
        i.asset_path
       FROM inventory_items ii
       INNER JOIN items i ON i.item_id = ii.item_id
       WHERE ii.uid = $1
       ORDER BY i.category, ii.acquired_at DESC`;

    const inventoryResult = await pool.query(inventoryQuery, [uid]);
    let userItems = inventoryResult.rows;

    if (!userItems.length) {
      const seeded = await seedStarterInventory(uid);
      if (seeded) {
        const seededResult = await pool.query(inventoryQuery, [uid]);
        userItems = seededResult.rows;
      }
    }

    const equipped = await getEquippedSlots(uid);

    res.json({
      items: userItems,
      equipped,
    });
  } catch (err) {
    if (err.code === "42P01") {
      return res.json({
        items: [],
        equipped: buildEquippedResponse(),
      });
    }
    res.status(500).json({ error: "Database error" });
  }
});

router.put("/inventory/:uid/equipped", async (req, res) => {
  const { uid } = req.params;
  const { type, slots } = req.body || {};

  if (!uid) {
    return res.status(400).json({ error: "Missing uid" });
  }

  if (!type || !SLOT_CONFIG[type]) {
    return res.status(400).json({ error: "Type must be either 'pet' or 'room'" });
  }

  if (!slots || typeof slots !== "object") {
    return res.status(400).json({ error: "Provide a slots object to update" });
  }

  const config = SLOT_CONFIG[type];
  const slotEntries = Object.entries(slots).filter(([slot]) => config.columns.includes(slot));

  if (!slotEntries.length) {
    return res.status(400).json({ error: "No valid slots provided" });
  }

  const values = slotEntries.map(([, value]) => value ?? null);
  const distinctItems = [...new Set(values.filter((value) => value !== null))];

  try {
    if (distinctItems.length) {
      const ownershipResult = await pool.query(
        `SELECT item_id 
         FROM inventory_items 
         WHERE uid = $1 AND item_id = ANY($2::text[])`,
        [uid, distinctItems]
      );

      if (ownershipResult.rows.length !== distinctItems.length) {
        return res.status(400).json({ error: "You can only equip items that belong to you" });
      }

      const categoryResult = await pool.query(
        `SELECT item_id, category 
         FROM items 
         WHERE item_id = ANY($1::text[])`,
        [distinctItems]
      );

      const invalidCategory = categoryResult.rows.find(
        (row) => !config.validCategories.includes(row.category)
      );

      if (invalidCategory) {
        return res.status(400).json({
          error: `Item ${invalidCategory.item_id} cannot be equipped in ${type} slots`,
        });
      }
    }

    const columnNames = slotEntries.map(([slot]) => slot);
    const valuePlaceholders = columnNames.map((_, idx) => `$${idx + 2}`).join(", ");

    await pool.query(
      `INSERT INTO ${config.table} (uid, ${columnNames.join(", ")})
       VALUES ($1, ${valuePlaceholders})
       ON CONFLICT (uid)
       DO UPDATE SET ${columnNames.map((col) => `${col} = EXCLUDED.${col}`).join(", ")}, updated_at = now()`,
      [uid, ...values]
    );

    const equipped = await getEquippedSlots(uid);

    res.json({ message: "Equipped items updated", equipped });
  } catch (err) {
    if (err.code === "42P01") {
      return res.status(400).json({ error: "Inventory tables are not configured" });
    }
    res.status(500).json({ error: "Database error" });
  }
});

// Get user's currency total
router.post("/user/currency", async (req, res) => {
  const { uid } = req.body;

  if (!uid) return res.status(400).json({ error: "Missing UID" });

  try {
    const result = await pool.query(
      "SELECT currency_total FROM users WHERE uid = $1",
      [uid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ currency: result.rows[0].currency_total });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

router.post("/user/reward", async (req, res) => {
  const { uid, amount } = req.body;

  if (!uid || amount === undefined)
    return res.status(400).json({ error: "Missing uid or amount" });

  try {
    // Update coins (add or subtract)
    await pool.query(
      `UPDATE users 
       SET currency_total = currency_total + $1 
       WHERE uid = $2`,
      [amount, uid] // if amount < 0, it subtracts
    );

    res.json({ success: true, change: amount });
  } catch (err) {
    console.error("Currency update error:", err);
    res.status(500).json({ error: "Failed to update currency" });
  }
});


export default router;
