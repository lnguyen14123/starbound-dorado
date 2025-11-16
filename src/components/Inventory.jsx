import React, { useCallback, useEffect, useMemo, useState } from "react";
import "../index.css";
import FurnitureIcon from '../assets/icons/furnitureInventory.svg';
import PetIcon from '../assets/icons/petInventory.svg';



const assetImports = import.meta.glob("../assets/**/*", {
  eager: true,
  import: "default",
});

const normalizeAssetKey = (assetPath = "") => {
  if (!assetPath) return null;
  const cleaned = assetPath
    .replace(/^src\//i, "")
    .replace(/^public\//i, "")
    .replace(/^\//, "");

  const candidates = [
    cleaned,
    `assets/${cleaned}`,
    cleaned.startsWith("assets/") ? cleaned : `assets/${cleaned}`,
    `../assets/${cleaned.replace(/^assets\//, "")}`,
    `../${cleaned}`,
  ];

  for (const candidate of candidates) {
    if (assetImports[`../${candidate}`]) {
      return `../${candidate}`;
    }
    if (assetImports[candidate]) {
      return candidate;
    }
  }
  return null;
};

const resolveAssetSource = (assetPath) => {
  if (!assetPath) return null;
  if (/^https?:\/\//i.test(assetPath)) return assetPath;
  const key = normalizeAssetKey(assetPath);
  return key ? assetImports[key] : null;
};

const CATEGORY_CONFIG = {
  hat: { label: "Hats", group: "pet", slot: "hat_item" },
  collar: { label: "Collars", group: "pet", slot: "collar_item" },
  breed: { label: "Breeds", group: "pet", slot: "breed_item" },
  wall: { label: "Walls", group: "room", slot: "wall_item" },
  floor: { label: "Floors", group: "room", slot: "floor_item" },
  decor: { label: "Decor", group: "room", slot: "decor_item" },
};

const GROUP_CONFIG = {
  pet: {
    label: "Pet Closet",
    accent: "from-[#ffd6de] to-[#f7c4bd]",
    description: "Dress your companion with new looks.",
  },
  room: {
    label: "Room Decor",
    accent: "from-[#ffeec4] to-[#f7d6a3]",
    description: "Swap out furniture to refresh the room.",
  },
};

const DEFAULT_EQUIPPED = {
  pet: { hat_item: null, collar_item: null, breed_item: null },
  room: { wall_item: null, floor_item: null, decor_item: null },
};

const REFRESH_INTERVAL_MS = 15000;

const getInitialUid = () =>
  typeof window === "undefined" ? "" : localStorage.getItem("uid") || "";

const formatDate = (value) => {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch (err) {
    return "—";
  }
};

export default function Inventory() {
  const [userId] = useState(getInitialUid);
  const [open, setOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState("pet");
  const [items, setItems] = useState([]);
  const [equipped, setEquipped] = useState(DEFAULT_EQUIPPED);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [pendingSlot, setPendingSlot] = useState("");
  const [lastSynced, setLastSynced] = useState(null);

  const groupedItems = useMemo(() => {
    const groups = Object.keys(CATEGORY_CONFIG).reduce((acc, key) => {
      acc[key] = [];
      return acc;
    }, {});

    items.forEach((item) => {
      if (groups[item.category]) {
        groups[item.category].push(item);
      }
    });

    return groups;
  }, [items]);

  const itemsById = useMemo(() => {
    const map = new Map();
    items.forEach((item) => map.set(item.item_id, item));
    return map;
  }, [items]);

  const visibleCategories = useMemo(
    () =>
      Object.entries(CATEGORY_CONFIG)
        .filter(([, meta]) => meta.group === activeGroup)
        .map(([key]) => key),
    [activeGroup]
  );

  const setEquippedState = useCallback((nextEquipped) => {
    setEquipped({
      pet: { ...DEFAULT_EQUIPPED.pet, ...(nextEquipped?.pet || {}) },
      room: { ...DEFAULT_EQUIPPED.room, ...(nextEquipped?.room || {}) },
    });
  }, []);

  const fetchInventory = useCallback(
    async ({ silent = false } = {}) => {
      if (!userId) {
        setError("Missing UID. Sign in to manage your closet.");
        return;
      }

      if (!silent) setLoading(true);

      try {
        const response = await fetch(`/api/inventory/${userId}`);
        if (!response.ok) {
          throw new Error("Unable to load inventory right now.");
        }
        const data = await response.json();
        setItems(data.items || []);
        setEquippedState(data.equipped);
        setError("");
        setLastSynced(new Date());
      } catch (err) {
        setError(err.message || "Unable to load inventory.");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [setEquippedState, userId]
  );

  useEffect(() => {
    if (!userId) {
      setError("Missing UID. Sign in to manage your closet.");
      return undefined;
    }

    fetchInventory();
    const interval = setInterval(
      () => fetchInventory({ silent: true }),
      REFRESH_INTERVAL_MS
    );

    return () => clearInterval(interval);
  }, [fetchInventory, userId]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const handleOpen = (event) => {
      if (!event?.detail) return;
      if (event.detail !== "pet" && event.detail !== "room") return;
      setActiveGroup(event.detail);
      setOpen(true);
    };

    window.addEventListener("openInventory", handleOpen);
    return () => window.removeEventListener("openInventory", handleOpen);
  }, []);

  useEffect(() => {
    if (!statusMessage) return undefined;
    const timeout = setTimeout(() => setStatusMessage(""), 4000);
    return () => clearTimeout(timeout);
  }, [statusMessage]);

  const handleSlotUpdate = useCallback(
    async (categoryKey, value, label) => {
      if (!userId) {
        setError("Missing UID. Sign in to manage your closet.");
        return;
      }

      const categoryMeta = CATEGORY_CONFIG[categoryKey];
      if (!categoryMeta) return;
      const slotKey = categoryMeta.slot;
      const type = categoryMeta.group;

      setPendingSlot(slotKey);
      try {
        const response = await fetch(`/api/inventory/${userId}/equipped`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, slots: { [slotKey]: value } }),
        });

        if (!response.ok) {
          throw new Error("Unable to update slot right now.");
        }

        const data = await response.json();
        setEquippedState(data.equipped);
        setStatusMessage(label);
        setError("");
        setLastSynced(new Date());
      } catch (err) {
        setError(err.message || "Unable to update slot.");
      } finally {
        setPendingSlot("");
      }
    },
    [setEquippedState, userId]
  );

  const handleEquip = (item) =>
    handleSlotUpdate(
      item.category,
      item.item_id,
      `${item.display_name} equipped`
    );

  const handleUnequip = (categoryKey) =>
    handleSlotUpdate(
      categoryKey,
      null,
      `${CATEGORY_CONFIG[categoryKey].label} cleared`
    );

  const isItemEquipped = (item) => {
    const config = CATEGORY_CONFIG[item.category];
    if (!config) return false;
    return equipped[config.group]?.[config.slot] === item.item_id;
  };

  const currentEquippedItem = (categoryKey) => {
    const config = CATEGORY_CONFIG[categoryKey];
    if (!config) return null;
    const id = equipped[config.group]?.[config.slot];
    if (!id) return null;
    return itemsById.get(id) || { display_name: "Unknown item" };
  };

  const activeGroupMeta = GROUP_CONFIG[activeGroup];

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => setOpen(false)}
        />
      )}

{/* RIGHT SIDE BUTTONS */}
<div className="fixed -right-9 top-1/5 z-40 flex flex-col gap-3">

  {/* PET ITEMS BUTTON */}
  <button
    type="button"
    className="h-[12vh] bg-[#FFBAC5] border-5 border-[#FE8693] pr-10 pl-2 transition-transform duration-200 hover:-translate-x-2
               flex items-center justify-center rounded-l-2xl shadow-lg cursor-pointer"
    onClick={() => {
      setActiveGroup("pet");
      setOpen(true);
    }}
  >
    <img
      src={PetIcon}
      alt="Pet Inventory"
      className="w-4/5 h-4/5 object-contain"
    />
  </button>

  {/* FURNITURE BUTTON */}
  <button
    type="button"
    className="h-[12vh] bg-[#FCD68D] border-5 border-[#DAA94B] pr-10 pl-2 transition-transform duration-200 hover:-translate-x-2
               flex items-center justify-center rounded-l-2xl shadow-lg cursor-pointer"
    onClick={() => {
      setActiveGroup("room");
      setOpen(true);
    }}
  >
    <img
      src={FurnitureIcon}
      alt="Furniture Inventory"
      className="w-4/5 h-4/5 object-contain"
    />
  </button>

</div>

      <div
        className={`fixed top-0 h-full z-40 transition-transform duration-500 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ width: "", left: "0px" }}
      >
        <div className="h-full w-full bg-[#f9ecd7] border-r-4 border-[#b0885f] shadow-2xl flex flex-col">
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b-2 border-[#d4b18c]">
            <div>
              <p className="text-[#9c6b3c] font-dongle text-3xl">Inventory</p>
              <h2 className="text-[#4b3b2f] font-dongle text-6xl leading-none font-bold">
                {activeGroupMeta.label}
              </h2>
            </div>
            <button
              type="button"
              className="text-3xl font-dongle text-[#a0613a] hover:text-[#80472a] transition-colors cursor-pointer"
              onClick={() => setOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="px-6 py-3 flex gap-3 ">
            {Object.entries(GROUP_CONFIG).map(([key, meta]) => (
              <button
                key={key}
                type="button"
                className={`flex-1 font-dongle text-3xl border-2 border-[#c9965e] rounded-full py-1 transition-colors  ${
                  activeGroup === key
                    ? "bg-[#c28554] text-white"
                    : "text-[#9c6b3c] bg-white hover:bg-[#f0d4b7]"
                }`}
                onClick={() => setActiveGroup(key)}
              >
                {meta.label}
              </button>
            ))}
          </div>

          <div className="px-6 text-[#6d4c38] font-dongle text-3xl">
            <p>{activeGroupMeta.description}</p>
            <div className="flex justify-between text-[#a27c5b] text-2xl mt-2">
              <span>
                Last synced:{" "}
                {lastSynced
                  ? lastSynced.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "—"}
              </span>
              {loading ? <span>Refreshing...</span> : null}
            </div>
          </div>

          {error && (
            <div className="mx-6 my-3 bg-[#fbe3e3] text-[#b84040] border border-[#f3b1b1] rounded-lg px-4 py-2 text-3xl font-dongle">
              {error}
            </div>
          )}

          {statusMessage && !error && (
            <div className="mx-6 my-3 bg-[#e6f5d0] text-[#557136] border border-[#b7d28a] rounded-lg px-4 py-2 text-3xl font-dongle">
              {statusMessage}
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6">
            {visibleCategories.map((categoryKey) => {
              const categoryItems = groupedItems[categoryKey] || [];
              const equippedItem = currentEquippedItem(categoryKey);

              return (
                <div
                  key={categoryKey}
                  className="bg-white/80 rounded-3xl border border-[#e3c8ac] p-4 shadow-inner"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-[#c08a57] font-dongle text-3xl">
                        {CATEGORY_CONFIG[categoryKey].label}
                      </p>
                      <p className="text-[#4b3b2f] font-dongle text-4xl font-bold">
                        {equippedItem
                          ? equippedItem.display_name
                          : "None equipped"}
                      </p>
                    </div>
                    {equippedItem && (
                      <button
                        type="button"
                        className="text-2xl font-dongle text-[#a15a35] underline decoration-dotted hover:text-[#7d3f1d]"
                        onClick={() => handleUnequip(categoryKey)}
                        disabled={
                          pendingSlot === CATEGORY_CONFIG[categoryKey].slot
                        }
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {categoryItems.length === 0 ? (
                    <p className="text-[#9e846e] font-dongle text-3xl">
                      You have not unlocked any items in this category yet.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {categoryItems.map((item) => {
                        const equippedCurrent = isItemEquipped(item);
                        const slotKey = CATEGORY_CONFIG[item.category].slot;
                        const resolvedImage = resolveAssetSource(
                          item.asset_path
                        );
                        const hasImage = Boolean(resolvedImage);

                        return (
                          <div
                            key={item.item_id}
                            className={`rounded-2xl border p-3 flex flex-col gap-2 bg-[#fffdfa] ${
                              equippedCurrent
                                ? "border-[#7fb069] shadow-[0_0_15px_rgba(127,176,105,0.35)]"
                                : "border-[#e1c4a5]"
                            }`}
                          >
                            {hasImage ? (
                              <img
                                src={resolvedImage}
                                alt={item.display_name}
                                className="h-24 object-contain rounded-xl w-full bg-[#f5e7d6]"
                                loading="lazy"
                              />
                            ) : (
                              <div className="h-24 rounded-xl bg-[#f5e7d6] flex items-center justify-center text-[#a47b5f] font-dongle text-3xl">
                                No preview
                              </div>
                            )}

                            <div className="flex flex-col">
                              <span className="font-dongle text-4xl text-[#4b3b2f] leading-none">
                                {item.display_name}
                              </span>
                              <span className="text-[#b08a6f] text-2xl font-dongle">
                                Added {formatDate(item.acquired_at)}
                              </span>
                            </div>

                            <button
                              type="button"
                              className={`font-dongle text-3xl rounded-2xl py-1 transition-colors ${
                                equippedCurrent
                                  ? "bg-[#b1d47f] text-[#425b24]"
                                  : "bg-[#f2d2b1] text-[#7d4b29] hover:bg-[#edc49b]"
                              }`}
                              onClick={() =>
                                equippedCurrent
                                  ? handleUnequip(item.category)
                                  : handleEquip(item)
                              }
                              disabled={pendingSlot === slotKey}
                            >
                              {equippedCurrent
                                ? pendingSlot === slotKey
                                  ? "Updating..."
                                  : "Equipped"
                                : pendingSlot === slotKey
                                ? "Saving..."
                                : "Equip"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
