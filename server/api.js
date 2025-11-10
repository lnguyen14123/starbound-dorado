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

    res.status(201).json({ message: "User created with starter inventory" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error inserting user:", err);
    res.status(500).json({ error: "Database error" });
  } finally {
    client.release();
  }
});
  
router.post("/choosePet", async (req, res) => {
  const { uid, petType } = req.body;

  if (!uid || !petType) {
    return res.status(400).json({ error: "Missing uid or petType" });
  }

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
    console.error("Error updating pet type:", err);
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
    console.error("Error fetching pet type:", err);
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
    console.error("Error creating task:", err);
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
    console.error("Error fetching tasks:", err);
    res.status(500).json({ error: "Database error" });
  }
});

router.post("/tasks/delete", async (req, res) => {
  const { uid, taskIds } = req.body;

  if (!taskIds || taskIds.length === 0) {
    return res.status(400).json({ error: "No tasks to delete" });
  }

  console.log(taskIds)
  console.log(uid)

  try {
    // Build a parameterized query to avoid SQL injection
    const placeholders = taskIds.map((_, i) => `$${i + 2}`).join(", ");
    const query = `DELETE FROM tasks WHERE user_id = $1 AND task_id IN (${placeholders})`;

    await pool.query(query, [uid, ...taskIds]);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete tasks" });
  }
});


export default router;
