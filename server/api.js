// server/api.js
import express from "express";
import { pool } from "./db.js";

const router = express.Router();

const PET_CATEGORIES = ["hat", "collar", "breed", "back"];
const FURNITURE_CATEGORIES = ["wall", "floor", "decor"];
const ITEM_CATEGORIES = ["hat", "collar", "breed", "wall", "floor", "decor"];

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

const STARTER_INVENTORY_ITEMS = [
  // "hat_party",
  // "collar_red",
  // "breed_graycat",
  "wall_basic",
  "floor_wood",
  "decor_plant",
];

const STARTER_EQUIPPED = {
  pet: {
    // hat: "hat_party",
    // collar: "collar_red",
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

const buildEquippedResponse = (petRow = {}, roomRow = {}) => ({
  pet: { ...DEFAULT_PET_SLOTS, ...petRow },
  room: { ...DEFAULT_ROOM_SLOTS, ...roomRow },
});

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

router.post("/users", async (req, res) => {
  const { uid, email, username } = req.body;
  
  if (!uid || !email || !username) {
    return res.status(400).json({ error: "Missing required fields: uid, email, or username" });
  }

  const client = await pool.connect();
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
    client.release();

    res.status(201).json({ message: "User created with starter inventory" });
  } catch (err) {
    await client.query("ROLLBACK");
    client.release();
    
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

  if (!uid || !name) {
    return res.status(400).json({ error: "Missing required fields: uid or name" });
  }

  try {
    // Check if user exists, if not create a basic user record
    const userCheck = await pool.query(
      "SELECT uid FROM users WHERE uid = $1",
      [uid]
    );

    if (userCheck.rows.length === 0) {
      try {
        await pool.query(
          "INSERT INTO users (uid, email, username) VALUES ($1, $2, $3) ON CONFLICT (uid) DO NOTHING",
          [uid, `${uid}@temp.com`, `User_${uid.substring(0, 8)}`]
        );
      } catch (userErr) {
        console.error("Error creating user:", userErr);
      }
    }

    const result = await pool.query(
      `INSERT INTO tasks (user_id, title, priority, due_date, difficulty) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [uid, name, priority, date || null, difficulty]
    );
    res.status(201).json({ task: result.rows[0] });
  } catch (err) {
    console.error("Error creating task:", err);
    
    // Handle foreign key constraint violation specifically
    if (err.code === '23503') {
      return res.status(400).json({ 
        error: "User not found. Please log out and log back in to sync your account." 
      });
    }
    
    res.status(500).json({ error: "Database error", details: err.message });
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

// Calculate XP based on priority and difficulty
function calculateXP(priority, difficulty) {
  // Priority multipliers
  const priorityMultipliers = {
    Low: 1,
    Medium: 1.5,
    High: 2
  };
  
  // Base XP by difficulty
  const baseXP = {
    Easy: 5,
    Moderate: 10,
    Hard: 15
  };
  
  const multiplier = priorityMultipliers[priority] || 1;
  const base = baseXP[difficulty] || 5;
  
  return Math.round(base * multiplier);
}

router.post("/tasks/delete", async (req, res) => {
  const { uid, taskIds } = req.body;

  if (!taskIds || taskIds.length === 0) {
    return res.status(400).json({ error: "No tasks to delete" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Get tasks before deleting to calculate XP
    const placeholders = taskIds.map((_, i) => `$${i + 2}`).join(", ");
    const getTasksQuery = `SELECT task_id, priority, difficulty FROM tasks WHERE user_id = $1 AND task_id IN (${placeholders})`;
    const tasksResult = await client.query(getTasksQuery, [uid, ...taskIds]);
    
    // Calculate total XP earned and create a map of task_id to task data
    let totalXP = 0;
    const taskMap = new Map();
    tasksResult.rows.forEach(task => {
      const xp = calculateXP(task.priority, task.difficulty);
      totalXP += xp;
      taskMap.set(task.task_id, task);

    });

    // Delete the tasks
    const deleteQuery = `DELETE FROM tasks WHERE user_id = $1 AND task_id IN (${placeholders})`;
    const deleteResult = await client.query(deleteQuery, [uid, ...taskIds]);    

    // Update user XP using user_xp_totals and user_xp_events tables
    if (totalXP > 0) {
      try {
        // Get current XP totals
        const xpResult = await client.query(
          `SELECT total_xp, level FROM user_xp_totals WHERE uid = $1`,
          [uid]
        );
        
        const currentTotalXP = xpResult.rows.length > 0 ? (xpResult.rows[0].total_xp || 0) : 0;
        const currentLevel = xpResult.rows.length > 0 ? (xpResult.rows[0].level || 1) : 1;
        const newTotalXP = currentTotalXP + totalXP;
        const newLevel = Math.floor(newTotalXP / 100) + 1;
        
        // Update or insert XP totals
        if (xpResult.rows.length === 0) {
          // Create new XP record
          await client.query(
            `INSERT INTO user_xp_totals (uid, total_xp, level, last_event_at, updated_at) 
             VALUES ($1, $2, $3, NOW(), NOW())`,
            [uid, newTotalXP, newLevel]
          );
        } else {
          // Update existing XP record
          await client.query(
            `UPDATE user_xp_totals 
             SET total_xp = $1, 
                 level = $2,
                 last_event_at = NOW(),
                 updated_at = NOW()
             WHERE uid = $3`,
            [newTotalXP, newLevel, uid]
          );
        }
        
        // Check and award level badges if level increased
        if (newLevel > currentLevel) {
          try {
            await checkAndAwardMilestoneBadges(uid, "level_reached", newLevel);
          } catch (badgeErr) {
            console.error("Error awarding level badges:", badgeErr);
          }
        }
        
        // Record XP events for each task completed
        for (const taskId of taskIds) {
          const task = taskMap.get(taskId);
          if (task) {
            const taskXP = calculateXP(task.priority, task.difficulty);
            
            // Map difficulty to lowercase for the constraint
            let difficultyLabel = null;
            if (task.difficulty) {
              const lower = task.difficulty.toLowerCase();
              if (lower === 'easy') difficultyLabel = 'low';
              else if (lower === 'moderate') difficultyLabel = 'medium';
              else if (lower === 'hard') difficultyLabel = 'hard';
            }
            
            await client.query(
              `INSERT INTO user_xp_events (uid, task_id, xp_amount, reason, difficulty_label, created_at)
               VALUES ($1, $2, $3, $4, $5, NOW())`,
              [uid, taskId, taskXP, 'task_completion', difficultyLabel]
            );
          }
        }
        

      } catch (xpErr) {
        if (xpErr.code === '42P01') {
          console.warn("user_xp_totals or user_xp_events table doesn't exist yet. XP tracking skipped.");
        } else {
          console.error("XP update error:", xpErr);
          throw xpErr;
        }
      }
    }

    // Track task completions and update streak 
    const today = new Date().toISOString().split('T')[0]; 
    
    // Record task completions
    try {
      await client.query(
        `INSERT INTO task_completions (uid, completion_date, tasks_completed_count)
         VALUES ($1, $2, $3)
         ON CONFLICT (uid, completion_date)
         DO UPDATE SET tasks_completed_count = task_completions.tasks_completed_count + $3`,
        [uid, today, taskIds.length]
      );
      
      await client.query(
        `INSERT INTO user_task_stats (uid, lifetime_tasks_completed, last_updated)
         VALUES ($1, $2, NOW())
         ON CONFLICT (uid)
         DO UPDATE SET 
           lifetime_tasks_completed = user_task_stats.lifetime_tasks_completed + $2,
           last_updated = NOW()`,
        [uid, taskIds.length]
      );
      
      // Get updated task count for badges 
      const statsResult = await client.query(
        `SELECT lifetime_tasks_completed FROM user_task_stats WHERE uid = $1`,
        [uid]
      );
      const totalTasksCompleted = statsResult.rows.length > 0 
        ? (statsResult.rows[0].lifetime_tasks_completed || 0) 
        : taskIds.length;
      
      // Check and award task completion badges
      try {
        await checkAndAwardMilestoneBadges(uid, "tasks_completed", totalTasksCompleted);
      } catch (badgeErr) {
        console.error("Error awarding task completion badges:", badgeErr);
      }
    } catch (statsErr) {
      if (statsErr.code === '42P01') {
        console.warn("task_completions or user_task_stats table doesn't exist yet. Stats tracking skipped.");
      } else {
        console.error("Error updating task stats:", statsErr);
      }
    }
    
    // Update user streak 
    const streakResult = await client.query(
      `SELECT * FROM user_streaks WHERE uid = $1`,
      [uid]
    );

    if (streakResult.rows.length === 0) {
      // Create new streak record - today is the first completion
      await client.query(
        `INSERT INTO user_streaks (uid, streak_days, longest_streak_days, streak_start_date, last_completed_date, updated_at)
         VALUES ($1, 1, 1, $2, $2, NOW())`,
        [uid, today]
      );
      
      // Check and award streak badges for first streak
      try {
        await checkAndAwardMilestoneBadges(uid, "streak_days", 1);
      } catch (badgeErr) {
        console.error("Error awarding streak badges:", badgeErr);
      }
    } else {
      const streak = streakResult.rows[0];
      const lastCompletedDate = streak.last_completed_date 
        ? new Date(streak.last_completed_date).toISOString().split('T')[0]
        : null;
      
      // Calculate days difference
      const todayDate = new Date(today);
      const lastDate = lastCompletedDate ? new Date(lastCompletedDate) : null;
      const daysDiff = lastDate 
        ? Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
        : null;

      let newStreakDays = 1;
      let newStreakStartDate = today;

      if (lastCompletedDate && daysDiff === 1) {
        // Consecutive day - increment streak
        newStreakDays = streak.streak_days + 1;
        newStreakStartDate = streak.streak_start_date || today;
      } else if (lastCompletedDate && daysDiff === 0) {
        // Same day - keep current streak 
        newStreakDays = streak.streak_days;
        newStreakStartDate = streak.streak_start_date || today;
      } else if (lastCompletedDate && daysDiff > 1) {
        // If streak is broken - start new streak
        newStreakDays = 1;
        newStreakStartDate = today;
      } else {
        // First completion - start new streak
        newStreakDays = 1;
        newStreakStartDate = today;
      }

      // Update longest streak if current streak is longer
      const newLongestStreak = Math.max(streak.longest_streak_days || 0, newStreakDays);

      await client.query(
        `UPDATE user_streaks 
         SET streak_days = $1, 
             longest_streak_days = $2,
             streak_start_date = $3,
             last_completed_date = $4,
             updated_at = NOW()
         WHERE uid = $5`,
        [newStreakDays, newLongestStreak, newStreakStartDate, today, uid]
      );
      
      // Check and award streak badges
      try {
        await checkAndAwardMilestoneBadges(uid, "streak_days", newStreakDays);
      } catch (badgeErr) {
        console.error("Error awarding streak badges:", badgeErr);
      }
    }

    await client.query("COMMIT");

    res.json({ success: true, xpEarned: totalXP });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error completing tasks:", err);
    console.error("Error details:", {
      message: err.message,
      code: err.code,
      detail: err.detail,
      stack: err.stack
    });
    res.status(500).json({ 
      error: "Failed to delete tasks", 
      details: err.message,
      code: err.code
    });
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
    // Get user streak from user_streaks table
    const result = await pool.query(
      `SELECT streak_days, longest_streak_days, last_completed_date, streak_start_date, updated_at
       FROM user_streaks 
       WHERE uid = $1`,
      [uid]
    );

    if (result.rows.length === 0) {
      return res.json({ 
        streak: 0, 
        longestStreak: 0,
        lastCompletionDate: null 
      });
    }

    const streakData = result.rows[0];
    const today = new Date().toISOString().split('T')[0]; // Today's date
    const lastCompletedDate = streakData.last_completed_date 
      ? new Date(streakData.last_completed_date).toISOString().split('T')[0]
      : null;

    // Check if streak is still valid (completed today or yesterday)
    let currentStreak = 0;
    if (lastCompletedDate) {
      const todayDate = new Date(today);
      const lastDate = new Date(lastCompletedDate);
      const daysDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Streak is valid if last completion was today or yesterday (daysDiff <= 1)
      if (daysDiff <= 1) {
        currentStreak = streakData.streak_days || 0;
      } else {
        // Streak broken (more than 1 day ago) - reset to 0
        currentStreak = 0;
      }
    }

    res.json({ 
      streak: currentStreak,
      longestStreak: streakData.longest_streak_days || 0,
      lastCompletionDate: streakData.last_completed_date
    });
  } catch (err) {
    // If table doesn't exist yet, return 0 streak
    if (err.code === '42P01') {
      return res.json({ 
        streak: 0, 
        longestStreak: 0,
        lastCompletionDate: null 
      });
    }
    console.error("Error fetching streak:", err);
    res.status(500).json({ error: "Failed to fetch streak" });
  }
});

// Get user's current XP
router.get("/user/xp", async (req, res) => {
  const { uid } = req.query;

  if (!uid) {
    return res.status(400).json({ error: "Missing uid" });
  }

  try {
    const result = await pool.query(
      `SELECT total_xp, level 
       FROM user_xp_totals 
       WHERE uid = $1`,
      [uid]
    );

    if (result.rows.length === 0) {
      // Return default values if no XP record exists
      return res.json({ 
        currentXP: 0,
        totalXP: 0,
        level: 1,
        progress: 0
      });
    }

    const xpData = result.rows[0];
    const totalXP = xpData.total_xp || 0;
    const level = xpData.level || 1;
    // Progress is the remainder of total_xp / 100 (current level progress)
    const progress = totalXP % 100;

    res.json({ 
      currentXP: progress,
      totalXP: totalXP,
      level: level,
      progress: progress
    });
  } catch (err) {
    // If table doesn't exist yet, return default values
    if (err.code === '42P01') {
      return res.json({ 
        currentXP: 0,
        totalXP: 0,
        level: 1,
        progress: 0
      });
    }
    console.error("Error fetching XP:", err);
    res.status(500).json({ error: "Failed to fetch XP" });
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
    // Get all friendships where the user is either user1 or user2, including task completion stats
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
        END as email,
        COALESCE(uts.lifetime_tasks_completed, 0) as lifetime_tasks_completed,
        COALESCE(us.streak_days, 0) as streak_days
       FROM friendships f
       LEFT JOIN users u1 ON f.user1_uid = u1.uid
       LEFT JOIN users u2 ON f.user2_uid = u2.uid
       LEFT JOIN user_task_stats uts ON uts.uid = CASE 
         WHEN f.user1_uid = $1 THEN f.user2_uid
         ELSE f.user1_uid
       END
       LEFT JOIN user_streaks us ON us.uid = CASE 
         WHEN f.user1_uid = $1 THEN f.user2_uid
         ELSE f.user1_uid
        END
       WHERE f.user1_uid = $1 OR f.user2_uid = $1
       ORDER BY f.created_at DESC`,
      [uid]
    );

    res.json({ friends: result.rows });
  } catch (err) {
    console.error("Error fetching friends:", err);
    res.status(500).json({ error: "Database error", details: err.message });
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
        
        // Get friend count for both users and award badges
        try {
          const friendCountResult1 = await pool.query(
            `SELECT COUNT(*) as count FROM friendships 
             WHERE user1_uid = $1 OR user2_uid = $1`,
            [user1]
          );
          const friendCount1 = parseInt(friendCountResult1.rows[0]?.count || 0);
          await checkAndAwardMilestoneBadges(user1, "friends_added", friendCount1);
          
          const friendCountResult2 = await pool.query(
            `SELECT COUNT(*) as count FROM friendships 
             WHERE user1_uid = $1 OR user2_uid = $1`,
            [user2]
          );
          const friendCount2 = parseInt(friendCountResult2.rows[0]?.count || 0);
          await checkAndAwardMilestoneBadges(user2, "friends_added", friendCount2);
        } catch (badgeErr) {
          console.error("Error awarding friend badges:", badgeErr);
        }
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

router.get('/inventory/pet_equipped/:uid', async (req, res) => {
    const { uid } = req.params;
    
    if (!uid)
      return res.status(400).json({ error: "Missing uid" });

  try {
      
        const result = await pool.query(
          `SELECT *
          FROM equipped_pet_slots
          WHERE uid = $1`,
          [uid] 
        );
            
      res.json({ data: result.rows });
    
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/inventory/add', async (req, res) => {
    const { uid, item } = req.body;

    if (!uid || !item) {
        return res.status(400).json({ error: "Missing uid or item" });
    }

    try {
        const result = await pool.query(
            `INSERT INTO inventory_items (uid, item_id)
             VALUES ($1, $2)
             RETURNING *`,
            [uid, item]
        );

        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error("Inventory insert error:", err);
        res.status(500).json({ error: "Server error" });
    }
});




//  Routing for Badges System
async function awardBadge(uid, badgeId) {
  try {
    await pool.query(
      `INSERT INTO user_badges (uid, badge_id)
       VALUES ($1, $2)
       ON CONFLICT (uid, badge_id) DO NOTHING`,
      [uid, badgeId]
    );
    return true;
  } catch (err) {
    console.error("Error awarding badge:", err);
    return false;
  }
}

// Helper function to check and award milestone badges
async function checkAndAwardMilestoneBadges(uid, milestoneType, currentValue) {
  const milestones = {
    tasks_completed: [1, 5, 10],
    friends_added: [1, 5, 10],
    level_reached: [5, 10, 20],
    streak_days: [1, 5, 10]
  };

  const badgeMapping = {
    tasks_completed: {
      1: "badge_task_1",
      5: "badge_task_5",
      10: "badge_task_10"
    },
    friends_added: {
      1: "badge_friend_1",
      5: "badge_friend_5",
      10: "badge_friend_10"
    },
    level_reached: {
      5: "badge_level_5",
      10: "badge_level_10",
      20: "badge_level_20"
    },
    streak_days: {
      1: "badge_streak_1",
      5: "badge_streak_5",
      10: "badge_streak_10"
    }
  };

  const relevantMilestones = milestones[milestoneType] || [];
  const relevantMapping = badgeMapping[milestoneType] || {};

  for (const milestone of relevantMilestones) {
    if (currentValue >= milestone) {
      const badgeId = relevantMapping[milestone];
      if (badgeId) {
        await awardBadge(uid, badgeId);
      }
    }
  }
}

// Get all available badges for the badges page
router.get("/badges/catalog", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT badge_id, display_name, asset_path, milestone_type, milestone_value, created_at 
       FROM badges
       ORDER BY milestone_type, milestone_value`
    );
    res.json({ badges: result.rows });
  } catch (err) {
    if (err.code === "42P01") {
      return res.json({ badges: [] });
    }
    res.status(500).json({ error: "Database error" });
  }
});

// Get the user's badges
router.get("/badges/:uid", async (req, res) => {
  const { uid } = req.params;

  if (!uid) {
    return res.status(400).json({ error: "Missing uid" });
  }

  try {
    // Get all badges in the database
    const result = await pool.query(
      `SELECT 
         b.badge_id,
         b.display_name,
         b.asset_path,
         b.milestone_type,
         b.milestone_value,
         ub.acquired_at,
         CASE WHEN ub.uid IS NOT NULL THEN true ELSE false END AS acquired
       FROM badges b
       LEFT JOIN user_badges ub ON b.badge_id = ub.badge_id AND ub.uid = $1
       ORDER BY b.milestone_type, b.milestone_value`,
      [uid]
    );

    const badges = result.rows.map((badge) => ({
      ...badge,
      acquired: badge.acquired === true || badge.acquired === "t",
    }));

    res.json({ badges });
  } catch (err) {
    if (err.code === "42P01") {
      return res.json({ badges: [] });
    }
    res.status(500).json({ error: "Database error" });
  }
});

// Award a badge to the user
router.post("/badges/award", async (req, res) => {
  const { uid, badgeId } = req.body;

  if (!uid || !badgeId) {
    return res.status(400).json({ error: "Missing uid or badgeId" });
  }

  try {
    const awarded = await awardBadge(uid, badgeId);
    if (awarded) {
      res.json({ success: true, message: "Badge awarded" });
    } else {
      res.status(500).json({ error: "Failed to award badge" });
    }
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/user/stats/:uid", async (req, res) => {
  const { uid } = req.params;

  if (!uid) {
    return res.status(400).json({ error: "Missing uid" });
  }

  try {
    // Get tasks completed
    let tasksCompleted = 0;
    try {
      const tasksResult = await pool.query(
        `SELECT lifetime_tasks_completed FROM user_task_stats WHERE uid = $1`,
        [uid]
      );
      tasksCompleted = tasksResult.rows.length > 0 
        ? (tasksResult.rows[0].lifetime_tasks_completed || 0) 
        : 0;
    } catch (err) {

    }

    // Get friends count
    let friendsCount = 0;
    try {
      const friendsResult = await pool.query(
        `SELECT COUNT(*) as count FROM friendships 
         WHERE user1_uid = $1 OR user2_uid = $1`,
        [uid]
      );
      friendsCount = parseInt(friendsResult.rows[0]?.count || 0);
    } catch (err) {
    }

    // Get usrs current levels  
    let level = 1;
    try {
      const levelResult = await pool.query(
        `SELECT level FROM user_xp_totals WHERE uid = $1`,
        [uid]
      );
      level = levelResult.rows.length > 0 
        ? (levelResult.rows[0].level || 1) 
        : 1;
    } catch (err) {
    }

    // Get user's current streak
    let streak = 0;
    try {
      const streakResult = await pool.query(
        `SELECT streak_days, last_completed_date FROM user_streaks WHERE uid = $1`,
        [uid]
      );
      if (streakResult.rows.length > 0) {
        const streakData = streakResult.rows[0];
        const today = new Date().toISOString().split('T')[0];
        const lastCompletedDate = streakData.last_completed_date 
          ? new Date(streakData.last_completed_date).toISOString().split('T')[0]
          : null;
        
        if (lastCompletedDate) {
          const todayDate = new Date(today);
          const lastDate = new Date(lastCompletedDate);
          const daysDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
          // Streak is valid if last completion was today or yesterday
          if (daysDiff <= 1) {
            streak = streakData.streak_days || 0;
          }
        }
      }
    } catch (err) {
    }

    res.json({
      tasksCompleted,
      friendsCount,
      level,
      streak
    });
  } catch (err) {
    console.error("Error fetching user stats:", err);
    res.status(500).json({ error: "Database error" });
  }
});

export default router;
