// MainPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import Sidebar from "./Sidebar";
import Floor from "./Floor";

import Window from "./Window";
import Dresser from "./Dresser";
import Plant from "./Plant";

// Pages
import SlidingPanel from "./SlidingPanel";
import SettingsPage from "./SettingsPage";
import BadgePage from "./BadgePage";
import TasksPage from "./TasksPage";
import StorePage from "./StorePage";
import Inventory from "./Inventory";

//import GrayCat1 from "../assets/gray_cat1.png";
//import YellowDog1 from "../assets/yellow_dog1.png";
import Pets from "./Pets";

import Checkmark from "../assets/checkmark.png";
import StreakFire from "../assets/streak_fire.png";

import PetInventory from "../assets/icons/petInventory.svg";
import FurnitureInventory from "../assets/icons/furnitureInventory.svg";

export default function MainPage() {
  const [petType, setPetType] = useState(null);
  const [activePanel, setActivePanel] = useState(null);
  const [panelVisible, setPanelVisible] = useState(false);

  // FOCUS ON PET WHEN OPENING INVENTORY 
  const [focusPet, setFocusPet] = useState(false);
  const [petItems, setPetItems] = useState([]);
  const [furnitureItems, setFurnitureItems] = useState([]);
  const [equippedPetItems, setEquippedPetItems] = useState({});

  const openPanel = (panelName) => {
    setActivePanel(panelName);
    // Give it one tick to mount before sliding in
    requestAnimationFrame(() => setPanelVisible(true));
  };

  const closePanel = () => {
    setPanelVisible(false);
    setFocusPet(false); 
    setTimeout(() => setActivePanel(null), 500); // match slide duration
  };

  
  // helper to load inventory from backend
  const loadInventory = useCallback(async (type) => {
    try {
      const uid = localStorage.getItem("uid");
      if (!uid) return;

      const response = await fetch(`/api/inventory/${uid}?type=${type}`);
      if (!response.ok) throw new Error("Failed to fetch inventory");

      const data = await response.json();
      if (type === "pet") {
        setPetItems(data.items || []);
        setEquippedPetItems(data.equipped || {});
      } else {
        setFurnitureItems(data.items || []);
      }
    } catch (err) {
      console.error("Inventory fetch failed:", err);
    }
  }, []);

  // equip handler
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
      }
    } catch (err) {
      console.error("Equip failed:", err);
    }
  };

  // button callbacks
  const handleDressUpClick = () => {
    setFocusPet(true);
    loadInventory("pet");
    openPanel("petInventory");
  };

  const handleFurnitureClick = () => {
    setFocusPet(true);
    loadInventory("furniture");
    openPanel("furnitureInventory");
  };


  useEffect(() => {
    const cachedPet = localStorage.getItem("petType");
    if (cachedPet) setPetType(cachedPet);

    const fetchPet = async () => {
      try {
        const uid = localStorage.getItem("uid");
        const response = await fetch("/api/user/pet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid }),
        });
        const data = await response.json();
        setPetType(data.petType);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPet();
  }, []);

  function ProgressBar({ progress }) {
    return (
      <div
        className="
        relative
        w-[20vw] h-[5vh]
        bg-[#ECF0A4] border-4 border-[#86A445]
        rounded-full shadow-md overflow-hidden
      "
      >
        <div
          className="
            h-full bg-[#86A445] 
            rounded-full transition-all duration-500
          "
          style={{
            width: `calc(${progress}% + 4px)`,
            marginLeft: "-4px",
          }}
          // style={{ width: 10 }}
        ></div>
      </div>
    );
  }

  const titleMap = {
    settings: "Settings",
    store: "Store",
    tasks: "Tasks",
    friends: "Friends",
    badges: "Badges",
    petInventory: "Dress Up",
    furnitureInventory: "Furniture",
  };
  const rightPanels = ["petInventory", "furnitureInventory"];

  const renderInventoryButtons = (anchorClass = "") => (
    <div className={`absolute ${anchorClass} flex flex-col gap-[2vh] z-40`}>
      <div className="flex items-center gap-3">
        <span className="text-4xl font-dongle text-[#4b3b2f]">dressup</span>
        <button
          className="
            w-[11vw] h-[10vh]
            bg-[#FFBAC5] border-[5px] border-[#FE8693]
            shadow-md cursor-pointer pl-4 pr-2
            transition-transform duration-200 ease-in-out
            hover:-translate-x-1
            flex items-center justify-between rounded-sm
          "
          onClick={handleDressUpClick}
        >
          <img src={PetInventory} alt="Pet Inventory" className="w-10" />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-4xl font-dongle text-[#4b3b2f]">furniture</span>
        <button
          className="
            w-[11vw] h-[10vh]
            bg-[#FCD68D] border-[5px] border-[#DAA94B]
            shadow-md cursor-pointer pl-4 pr-2
            transition-transform duration-200 ease-in-out
            hover:-translate-x-1 
            flex items-center justify-between rounded-sm
          "
          onClick={handleFurnitureClick}
        >
          <img src={FurnitureInventory} alt="Furniture Inventory" className="w-10" />
        </button>
      </div>
    </div>
  );

  const isInventoryPanel = activePanel && rightPanels.includes(activePanel);

  return (
    <div className="grid grid-cols-[80px_1fr] h-screen w-screen bg-[#dbb9a0] relative overflow-hidden">
      <Sidebar
        onSettingsClick={() => openPanel("settings")}
        onStoreClick={() => openPanel("store")}
        onTasksClick={() => openPanel("tasks")}
        onFriendsClick={() => openPanel("friends")}
        onBadgesClick={() => openPanel("badges")}
      />

      <div className="w-screen flex justify-center">
        {focusPet ? (
          <div className="w-full h-full flex">
            <div className="relative w-1/2 h-full flex items-center justify-center bg-[#f8e8d5]">
              {renderInventoryButtons("left-[4vw] top-[15vh]")}
              <Pets
                petType={petType}
                equippedItems={equippedPetItems}
                focusMode
                onDressUpClick={handleDressUpClick}
              />
            </div>
            <div className="w-1/2 h-full relative" />
          </div>
        ) : (
          <div className="relative w-full flex justify-center">
            <Floor />
            {renderInventoryButtons("left-[4vw] top-[20vh]")}


            <div
              className="absolute flex top-[3vh] left-[45vw] -translate-x-1/2 
                        bg-[#f2be9c] border-3 border-[#7d5c47] 
                        rounded-full drop-shadow-[3px_3px_3px_rgba(0,0,0,0.4)] z-30
                        w-[43vw] h-[9vh] items-center"
            >
              <img
                src={StreakFire}
                className="w-13 ml-[1vw] h-auto drop-shadow-[2px_2px_2px_rgba(0,0,0,.3)]"
              />
              <span className="translate-y-[2px] ml-1 text-[#41521b] font-dongle text-6xl font-bold">
                3x
              </span>

              <span className="translate-y-[2px] ml-39 mr-2 text-[#41521b] font-dongle text-5xl font-bold">
                XP
              </span>

              <ProgressBar progress={65} />

              <div
                className="absolute top-[0vh] -right-[26vw] 
                            bg-[#b1d47f] border-3 border-[#5a7435] 
                            rounded-full px-8 py-1 
                            text-white font-dongle text-6xl 
                            drop-shadow-[3px_3px_3px_rgba(0,0,0,0.4)] z-30
                            w-[22vw] h-[9vh] font-bold
                            flex items-center justify-center gap-3
                            [text-shadow:_2px_2px_0_#000,_-2px_2px_0_#000,_2px_-2px_0_#000,_-2px_-2px_0_#000]"
              >
                <img
                  src={Checkmark}
                  className="w-12 h-auto drop-shadow-[2px_2px_2px_rgba(0,0,0,.3)]"
                  alt="Checkmark"
                />
                <span className="translate-y-[2px]">100</span>
              </div>
            </div>

            <Window />
            <Dresser />
            <Plant />

            <Pets
              petType={petType}
              equippedItems={equippedPetItems}
              onDressUpClick={handleDressUpClick}
            />
          </div>
        )}
      </div>

      {activePanel && (
        <SlidingPanel
          show={panelVisible}
          onClose={closePanel}
          title={titleMap[activePanel] || ""}
          from={isInventoryPanel ? "right" : "left"}
          dimBackground={!isInventoryPanel}
        >
          {activePanel === "badges" && <BadgePage onClose={closePanel} />}
          {activePanel === "settings" && <SettingsPage onClose={closePanel} />}
          {activePanel === "tasks" && <TasksPage onClose={closePanel} />}
          {activePanel === "store" && <StorePage onClose={closePanel} />}
          {activePanel === "petInventory" && (
            <Inventory 
              type="pet"
              items={petItems}
              onEquip={handleEquip}
              equippedItems={equippedPetItems}
              />
          )}
          {activePanel === "furnitureInventory" && (
            <Inventory
              type="furniture"
              items={furnitureItems}
              onEquip={handleEquip}
            />
          )}
        </SlidingPanel>
      )}
    </div>
  );
}
