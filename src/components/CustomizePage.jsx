import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Pets from "./Pets";
import Inventory from "./Inventory";

export default function CustomizePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState("pet");
  const [petType, setPetType] = useState(null);
  const [items, setItems] = useState([]);
  const [equippedPetItems, setEquippedPetItems] = useState({});
  const [equippedFurnitureItems, setEquippedFurnitureItems] = useState({});
  const [loadingInventory, setLoadingInventory] = useState(false);
  const handleBackToRoom = useCallback(() => {
    try {
      if (window.history.length > 1) {
        navigate(-1);
        return;
      }
    } catch (_) {}
    navigate("/", { replace: true });
  }, [navigate]);

  useEffect(() => {
    const param = searchParams.get("mode");
    if (param === "furniture") {
      setMode("furniture");
    } else {
      setMode("pet");
    }
  }, [searchParams]);

  useEffect(() => {
    const cachedPet = localStorage.getItem("petType");
    if (cachedPet) {
      setPetType(cachedPet);
    }

    const fetchPet = async () => {
      try {
        const uid = localStorage.getItem("uid");
        const response = await fetch("/api/user/pet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid }),
        });
        const data = await response.json();
        if (data.petType) {
          setPetType(data.petType);
        }
      } catch (err) {
        console.error("Failed to load pet type:", err);
      }
    };
    fetchPet();
  }, []);

  const loadInventory = useCallback(async (type) => {
    try {
      setLoadingInventory(true);
      const uid = localStorage.getItem("uid");
      if (!uid) return;

      const response = await fetch(`/api/inventory/${uid}?type=${type}`);
      if (!response.ok) throw new Error("Failed to fetch inventory");

      const data = await response.json();
      setItems(data.items || []);
      if (type === "pet") {
        setEquippedPetItems(data.equipped || {});
      } else if (type === "furniture") {
        setEquippedFurnitureItems(data.equipped || {});
      }
    } catch (err) {
      console.error("Inventory fetch failed:", err);
    } finally {
      setLoadingInventory(false);
    }
  }, []);

  useEffect(() => {
    loadInventory(mode);
  }, [mode, loadInventory]);

  const handleEquip = async (type, slot, item) => {
    try {
      const uid = localStorage.getItem("uid");
      await fetch("/api/inventory/equip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, type, slot, itemId: item.item_id }),
      });

      if (type === "pet") {
        setEquippedPetItems((prev) => ({ ...prev, [slot]: item }));
      } else if (type === "furniture") {
        setEquippedFurnitureItems((prev) => ({ ...prev, [slot]: item }));
      }
    } catch (err) {
      console.error("Equip failed:", err);
    }
  };

  const handleModeSwitch = (nextMode) => {
    if (mode === nextMode) return;
    navigate(`/customize?mode=${nextMode}`, { replace: true });
    setMode(nextMode);
  };

  const wallImage = equippedFurnitureItems.wall?.asset_path;
  const floorImage = equippedFurnitureItems.floor?.asset_path;
  const decorImage = equippedFurnitureItems.decor?.asset_path;

  const headerTitle = useMemo(
    () => (mode === "pet" ? "Dress Up" : "Furniture"),
    [mode]
  );

  return (
    <div className="w-screen h-screen bg-[#dbb9a0] flex">
      <div
        className="w-1/2 h-full flex flex-col items-center justify-center relative overflow-hidden"
        style={{
          backgroundColor: wallImage ? "transparent" : "#f6ddc9",
          backgroundImage: wallImage ? `url(${wallImage})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <button
          type="button"
          onClick={handleBackToRoom}
          className="absolute top-6 left-6 z-50 px-6 py-2 rounded-full bg-white/80 border-2 border-[#b58a6b] text-3xl font-dongle font-bold text-[#4b3b2f] cursor-pointer hover:-translate-x-1 transition"
        >
          ← back to room
        </button>
        {decorImage && (
          <img
            src={decorImage}
            alt="Decor"
            className="absolute top-16 right-12 w-40 h-auto drop-shadow-lg pointer-events-none"
          />
        )}
        <Pets petType={petType} equippedItems={equippedPetItems} focusMode />
        {floorImage && (
          <img
            src={floorImage}
            alt="Floor"
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90%] h-auto pointer-events-none"
          />
        )}
      </div>

      <div className="w-1/2 h-full flex flex-col px-10 py-12">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-6xl font-dongle font-bold text-[#4b3b2f]">
            {headerTitle}
          </h1>
          <div className="flex gap-4">
            <button
              onClick={() => handleModeSwitch("pet")}
              className={`px-6 py-2 rounded-2xl text-3xl font-dongle font-bold cursor-pointer ${
                mode === "pet"
                  ? "bg-[#ffbac5] border-4 border-[#fe8693] text-[#4b3b2f]"
                  : "bg-[#fef5ef] border-4 border-transparent text-[#b08b6e]"
              }`}
            >
              Dress Up
            </button>
            <button
              onClick={() => handleModeSwitch("furniture")}
              className={`px-6 py-2 rounded-2xl text-3xl font-dongle font-bold cursor-pointer ${
                mode === "furniture"
                  ? "bg-[#fcd68d] border-4 border-[#daa94b] text-[#4b3b2f]"
                  : "bg-[#fef5ef] border-4 border-transparent text-[#b08b6e]"
              }`}
            >
              Furniture
            </button>
          </div>
        </div>

        <div className="flex-1 bg-[#f7e2cc] border-4 border-[#d3ab8a] rounded-[32px] shadow-inner overflow-hidden">
          {loadingInventory ? (
            <div className="w-full h-full flex items-center justify-center text-4xl font-dongle text-[#4b3b2f]">
              Loading inventory...
            </div>
          ) : (
            <Inventory
              type={mode}
              items={items}
              onEquip={handleEquip}
              equippedItems={
                mode === "pet" ? equippedPetItems : equippedFurnitureItems
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
