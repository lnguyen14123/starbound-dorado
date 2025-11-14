// server/api.js
import express from "express";
import { pool } from "./db.js";

const router = express.Router();

const PET_CATEGORIES = ["hat", "collar", "breed", "back"];
const FURNITURE_CATEGORIES = ["wall", "floor", "decor"];

const PET_SLOT_COLUMNS = {
  hat: "hat_item",
  collar: "collar_item",
  breed: "breed_item",
};

const FURNITURE_SLOT_COLUMNS = {
  wall: "wall_item",
  floor: "floor_item",
  decor: "decor_item",
};

const SLOT_COLUMN_MAP = {
  pet: PET_SLOT_COLUMNS,
  furniture: FURNITURE_SLOT_COLUMNS,
};

const CATEGORY_FILTERS = {
  pet: PET_CATEGORIES,
  furniture: FURNITURE_CATEGORIES,
};

const STARTER_INVENTORY_ITEMS = [
  "hat_party",
  "collar_red",
  "breed_graycat",
  "wall_basic",
  "floor_wood",
  "decor_plant",
];

const STARTER_EQUIPPED = {
  pet: {
    hat: "hat_party",
    collar: "collar_red",
    breed: "breed_graycat",
  },
  furniture: {
    wall: "wall_basic",
    floor: "floor_wood",
    decor: "decor_plant",
  },
};

const PET_TYPE_TO_BREED_ITEM = {
  graycat: "breed_graycat",
  yellowdog: "breed_yellowdog",
};

const ITEM_SELECT_FIELDS = `
  i.item_id,
  i.category AS slot,
  i.display_name AS name,
  i.asset_path
`;

async function getExistingItemIds(client, itemIds) {
  if (!itemIds?.length) {
    return [];
  }
  const { rows } = await client.query(
    "SELECT item_id FROM items WHERE item_id = ANY($1)",
    [itemIds]
  );
  return rows.map((row) => row.item_id);
}

async function fetchItemById(itemId) {
  if (!itemId) return null;
  const { rows } = await pool.query(
    `SELECT ${ITEM_SELECT_FIELDS}
     FROM items i
     WHERE i.item_id = $1`,
    [itemId]
  );
  return rows[0] || null;
}

async function fetchEquippedSlots(uid, type, itemMap = new Map()) {
  const slotColumns = SLOT_COLUMN_MAP[type];
  if (!slotColumns) return {};

  const table =
    type === "furniture" ? "equipped_room_slots" : "equipped_pet_slots";
  const columnList = Object.values(slotColumns);
  if (columnList.length === 0) {
    return {};
  }

  const { rows } = await pool.query(
    `SELECT ${columnList.join(", ")} FROM ${table} WHERE uid = $1`,
    [uid]
  );

  if (!rows.length) {
    return {};
  }

  const equipped = {};
  const record = rows[0];

  for (const [slot, column] of Object.entries(slotColumns)) {
    const itemId = record[column];
    if (!itemId) continue;

    const cached = itemMap.get(itemId);
    const itemData = cached || (await fetchItemById(itemId));
    if (itemData) {
      equipped[slot] = itemData;
    }
  }

  return equipped;
}

router.post("/users", async (req, res) => {
  const { uid, email, username } = req.body;
  
  if (!uid || !email || !username) {
    return res.status(400).json({ error: "Missing required fields: uid, email, or username" });
  }

  try {
    await client.query("BEGIN");
    await client.query(
      "INSERT INTO users (uid, email, username) VALUES ($1, $2, $3)",
      [uid, email, username]
    );

    const starterUniverse = Array.from(
      new Set(
        [
          ...STARTER_INVENTORY_ITEMS,
          ...Object.values(STARTER_EQUIPPED.pet || {}),
          ...Object.values(STARTER_EQUIPPED.furniture || {}),
        ].filter(Boolean)
      )
    );
    const existingItemIds = new Set(
      await getExistingItemIds(client, starterUniverse)
    );

    const starterInventoryList = STARTER_INVENTORY_ITEMS.filter((itemId) =>
      existingItemIds.has(itemId)
    );

    if (starterInventoryList.length) {
      const values = starterInventoryList
        .map((_, idx) => `($1, $${idx + 2})`)
        .join(", ");

      await client.query(
        `INSERT INTO inventory_items (uid, item_id)
         VALUES ${values}
         ON CONFLICT (uid, item_id) DO NOTHING`,
        [uid, ...starterInventoryList]
      );
    }

    const petSlotEntries = Object.entries(STARTER_EQUIPPED.pet || {}).filter(
      ([, itemId]) => existingItemIds.has(itemId)
    );
    if (petSlotEntries.length) {
      const petColumns = petSlotEntries.map(([slot]) => slot);
      const columnList = [
        "uid",
        ...petColumns.map((slot) => PET_SLOT_COLUMNS[slot]),
      ];
      const valuePlaceholders = columnList
        .map((_, idx) => `$${idx + 1}`)
        .join(", ");

      const params = [uid, ...petSlotEntries.map(([, itemId]) => itemId)];

      await client.query(
        `INSERT INTO equipped_pet_slots (${columnList.join(", ")})
         VALUES (${valuePlaceholders})
         ON CONFLICT (uid)
         DO UPDATE SET ${petColumns
           .map(
             (slot) =>
               `${PET_SLOT_COLUMNS[slot]} = EXCLUDED.${PET_SLOT_COLUMNS[slot]}`
           )
           .join(", ")}`,
        params
      );
    }

    const furnitureSlotEntries = Object.entries(
      STARTER_EQUIPPED.furniture || {}
    ).filter(([, itemId]) => existingItemIds.has(itemId));
    if (furnitureSlotEntries.length) {
      const furnitureColumns = furnitureSlotEntries.map(([slot]) => slot);
      const columnList = [
        "uid",
        ...furnitureColumns.map((slot) => FURNITURE_SLOT_COLUMNS[slot]),
      ];
      const valuePlaceholders = columnList
        .map((_, idx) => `$${idx + 1}`)
        .join(", ");
      const params = [
        uid,
        ...furnitureSlotEntries.map(([, itemId]) => itemId),
      ];

      await client.query(
        `INSERT INTO equipped_room_slots (${columnList.join(", ")})
         VALUES (${valuePlaceholders})
         ON CONFLICT (uid)
         DO UPDATE SET ${furnitureColumns
           .map(
             (slot) =>
               `${FURNITURE_SLOT_COLUMNS[slot]} = EXCLUDED.${FURNITURE_SLOT_COLUMNS[slot]}`
           )
           .join(", ")}`,
        params
      );
    }

    await client.query("COMMIT");

    res.status(201).json({ message: "User created with starter inventory" });
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
  
  const breedItemId = PET_TYPE_TO_BREED_ITEM[petType];
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query("UPDATE users SET pet_type = $1 WHERE uid = $2", [
      petType,
      uid,
    ]);

    const [existingBreedId] = await getExistingItemIds(client, [breedItemId]);

    if (existingBreedId) {
      await client.query(
        `INSERT INTO inventory_items (uid, item_id)
         VALUES ($1, $2)
         ON CONFLICT (uid, item_id) DO NOTHING`,
        [uid, existingBreedId]
      );

      await client.query(
        `INSERT INTO equipped_pet_slots (uid, breed_item)
         VALUES ($1, $2)
         ON CONFLICT (uid)
         DO UPDATE SET breed_item = EXCLUDED.breed_item`,
        [uid, existingBreedId]
      );
    }

    await client.query("COMMIT");

    res.status(200).json({ message: "Pet choice saved successfully" });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: "Database error" });
  } finally {
    client.release();
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

router.get("/inventory/:uid", async (req, res) => {
  const { uid } = req.params;
  const { type } = req.query;

  if (!uid) {
    return res.status(400).json({ error: "Missing UID" });
  }

  const categories = CATEGORY_FILTERS[type] || [
    ...new Set([...PET_CATEGORIES, ...FURNITURE_CATEGORIES]),
  ];

  try {
    const params = [uid, categories];
    const { rows: items } = await pool.query(
      `SELECT ${ITEM_SELECT_FIELDS}
       FROM inventory_items ii
       JOIN items i ON i.item_id = ii.item_id
       WHERE ii.uid = $1
         AND i.category = ANY($2)
       ORDER BY i.display_name`,
      params
    );

    const itemMap = new Map(items.map((item) => [item.item_id, item]));
    const equipped = await fetchEquippedSlots(uid, type || "pet", itemMap);

    return res.json({ items, equipped });
  } catch (err) {
    console.error("Error fetching inventory:", err);
    return res.status(500).json({ error: "Failed to fetch inventory" });
  }
});

router.post("/inventory/equip", async (req, res) => {
  const { uid, type, slot, itemId } = req.body;

  if (!uid || !type || !slot || !itemId) {
    return res.status(400).json({ error: "Missing equip payload fields" });
  }

  const slotColumns = SLOT_COLUMN_MAP[type];
  const column = slotColumns?.[slot];

  if (!column) {
    return res.status(400).json({ error: "Unsupported slot" });
  }

  const table =
    type === "furniture" ? "equipped_room_slots" : "equipped_pet_slots";

  try {
    await pool.query(
      `INSERT INTO ${table} (uid, ${column})
       VALUES ($1, $2)
       ON CONFLICT (uid)
       DO UPDATE SET ${column} = EXCLUDED.${column}`,
      [uid, itemId]
    );

    const equipped = await fetchEquippedSlots(uid, type);

    return res.json({ equipped });
  } catch (err) {
    console.error("Error equipping item:", err);
    return res.status(500).json({ error: "Failed to equip item" });
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

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // First, record task completions before deleting
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
    
    // Insert a single completion record for today (one record per day, regardless of task count)
    // Using INSERT ... ON CONFLICT to handle multiple task completions on the same day
    // We use the first task_id, but the important part is tracking the completion_date
    await client.query(
      `INSERT INTO task_completions (user_id, task_id, completion_date)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, completion_date) DO NOTHING`,
      [uid, taskIds[0], today]
    );

    // Then delete the tasks
    const placeholders = taskIds.map((_, i) => `$${i + 2}`).join(", ");
    const query = `DELETE FROM tasks WHERE user_id = $1 AND task_id IN (${placeholders})`;

    await client.query(query, [uid, ...taskIds]);

    await client.query("COMMIT");

    res.json({ success: true });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error completing tasks:", err);
    res.status(500).json({ error: "Failed to delete tasks" });
  } finally {
    client.release();
  }
});

// Get user's current streak
router.get("/tasks/streak", async (req, res) => {
  const { uid } = req.query;

  if (!uid) {
    return res.status(400).json({ error: "Missing uid" });
  }

  try {
    // Get all unique completion dates for this user, ordered by date descending
    const result = await pool.query(
      `SELECT DISTINCT completion_date 
       FROM task_completions 
       WHERE user_id = $1 
       ORDER BY completion_date DESC`,
      [uid]
    );

    if (result.rows.length === 0) {
      return res.json({ streak: 0, lastCompletionDate: null });
    }

    // Calculate streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Convert completion dates to Date objects and create a Set for quick lookup
    const completionDateSet = new Set(
      result.rows.map(row => {
        const date = new Date(row.completion_date);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      })
    );

    const mostRecentDate = new Date(result.rows[0].completion_date);
    mostRecentDate.setHours(0, 0, 0, 0);
    
    // Calculate days difference from today
    const daysDiff = Math.floor((today.getTime() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24));

    // If the most recent completion is more than 1 day ago, streak is broken
    if (daysDiff > 1) {
      return res.json({ streak: 0, lastCompletionDate: mostRecentDate.toISOString().split('T')[0] });
    }

    // Count consecutive days starting from today (or yesterday if no completion today)
    let streak = 0;
    let checkDate = new Date(today);
    
    // If no completion today, start from yesterday
    if (daysDiff === 1) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Count backwards day by day until we find a gap
    while (true) {
      const checkTime = checkDate.getTime();
      
      if (completionDateSet.has(checkTime)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    res.json({ 
      streak, 
      lastCompletionDate: mostRecentDate.toISOString().split('T')[0] 
    });
  } catch (err) {
    // If table doesn't exist yet, return 0 streak
    if (err.code === '42P01') {
      return res.json({ streak: 0, lastCompletionDate: null });
    }
    console.error("Error calculating streak:", err);
    res.status(500).json({ error: "Failed to calculate streak" });
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


export default router;
