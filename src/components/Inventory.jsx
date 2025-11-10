// user based on ID, .json
// items in inventory (expandable list) --> one .json doc, table in sql postgres

// numeric    , cloud (neon)
// userID in col1, inventory in col2 (.json), 


// Petstore
// finite list
// use rows/cols to store items
// rows:
// itemID | itemName | itemType | itemAttributes (.json) | itemImageURL
// 1      | Red Collar | collar   | {"color": "red"}       | /assets/pets/clothing/collars/red_collar.svg
// 2      | Blue Collar| collar   | {"color": "blue"}      | /assets/pets/clothing/collars/blue_collar.svg

// cloudcode
// stitch for ux
// gemini for project management

// Inventory.jsx

import React, { useMemo, useState } from "react";

// Configure tabs per inventory type
const SLOT_TABS = {
  pet: [
    { id: "hat", label: "Hats" },
    { id: "collar", label: "Collars" },
    { id: "back", label: "Back" },
  ],
  furniture: [
    { id: "wall", label: "Wall" },
    { id: "floor", label: "Floor" },
    { id: "decor", label: "Decor" },
  ],
};

export default function Inventory({ type, items = [], onEquip, equippedItems = {} }) {
  const tabs = SLOT_TABS[type] || [];
  const [activeSlot, setActiveSlot] = useState(tabs[0]?.id ?? null);

  const filteredItems = useMemo(
    () => items.filter((item) => !activeSlot || item.slot === activeSlot),
    [items, activeSlot]
  );

  const handleEquipClick = (item) => onEquip(type, item.slot, item);

  return (
    <div className="w-full h-full font-dongle text-[#4b3b2f]">
      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSlot(tab.id)}
            className={`px-6 py-3 rounded-2xl border-4 text-3xl font-bold transition ${
              activeSlot === tab.id
                ? "bg-[#f5d9bd] border-[#d09564]"
                : "bg-[#fdf4e9] border-transparent opacity-70"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="bg-[#f7e2cc] border-4 border-[#d3ab8a] rounded-3xl p-6 shadow-inner">
        <div className="grid grid-cols-3 gap-5">
          {filteredItems.map((item) => {
            const isEquipped = equippedItems[item.slot]?.item_id === item.item_id;
            return (
              <button
                key={item.item_id}
                onClick={() => handleEquipClick(item)}
                className={`relative h-32 rounded-2xl bg-[#fef7ef] border-4 flex items-center justify-center transition ${
                  isEquipped ? "border-[#d46b46] ring-4 ring-[#f5c2b0]/50" : "border-transparent"
                }`}
              >
                <img src={item.asset_path} alt={item.name} className="max-h-20 object-contain" />
                <span className="absolute bottom-1 text-2xl font-bold">{item.name}</span>
              </button>
            );
          })}

          {/* empty slots to keep grid shape */}
          {filteredItems.length === 0 &&
            Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={`empty-${idx}`}
                className="h-32 rounded-2xl border-2 border-dashed border-[#d9c0ab] bg-[#fdf4e9]"
              />
            ))}
        </div>
      </div>
    </div>
  );
}
