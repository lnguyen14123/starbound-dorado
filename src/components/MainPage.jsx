// MainPage.jsx
import React, { useEffect, useState } from "react";
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

import Pets from "./Pets";

import Checkmark from "../assets/checkmark.png";
import StreakFire from "../assets/streak_fire.png";

import PetInventory from "../assets/icons/petInventory.svg";
import FurnitureInventory from "../assets/icons/furnitureInventory.svg";
import { useNavigate } from "react-router-dom";

export default function MainPage() {
  const navigate = useNavigate();
  const [petType, setPetType] = useState(null);
  const [activePanel, setActivePanel] = useState(null);
  const [panelVisible, setPanelVisible] = useState(false);

  const openPanel = (panelName) => {
    setActivePanel(panelName);
    // Give it one tick to mount before sliding in
    requestAnimationFrame(() => setPanelVisible(true));
  };

  const closePanel = () => {
    setPanelVisible(false);
    setTimeout(() => setActivePanel(null), 500); // match slide duration
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
  };

  const renderInventoryButtons = (anchorClass = "") => (
    <div className={`absolute ${anchorClass} flex flex-col gap-[2vh] z-40 pointer-events-none`}>
      <div className="flex items-center gap-3 pointer-events-auto">
        <span className="text-4xl font-dongle text-[#4b3b2f]"></span>
        <button
          className="
            w-[11vw] h-[10vh]
            bg-[#FFBAC5] border-[5px] border-[#FE8693]
            shadow-md cursor-pointer pl-4 pr-2
            transition-transform duration-200 ease-in-out
            hover:-translate-x-1
            flex items-center justify-between rounded-sm
          "
          onClick={() => navigate("/customize?mode=pet")}
        >
          <img src={PetInventory} alt="Pet Inventory" className="w-10" />
        </button>
      </div>

      <div className="flex items-center gap-3 pointer-events-auto">
        <span className="text-4xl font-dongle text-[#4b3b2f]"></span>
        <button
          className="
            w-[11vw] h-[10vh]
            bg-[#FCD68D] border-[5px] border-[#DAA94B]
            shadow-md cursor-pointer pl-4 pr-2
            transition-transform duration-200 ease-in-out
            hover:-translate-x-1 
            flex items-center justify-between rounded-sm
          "
          onClick={() => navigate("/customize?mode=furniture")}
        >
          <img src={FurnitureInventory} alt="Furniture Inventory" className="w-10" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-[80px_1fr] h-screen w-screen bg-[#dbb9a0] relative overflow-hidden">
      <Sidebar
        onSettingsClick={() => openPanel("settings")}
        onStoreClick={() => openPanel("store")}
        onTasksClick={() => openPanel("tasks")}
        onFriendsClick={() => openPanel("friends")}
        onBadgesClick={() => openPanel("badges")}
      />

      <div className="w-screen flex justify-center relative">
        <Floor />

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
        />

        {renderInventoryButtons("right-[3vw] top-[20vh]")}
      </div>

      {activePanel && (
        <SlidingPanel
          show={panelVisible}
          onClose={closePanel}
          title={titleMap[activePanel] || ""}
        >
          {activePanel === "badges" && <BadgePage onClose={closePanel} />}
          {activePanel === "settings" && <SettingsPage onClose={closePanel} />}
          {activePanel === "tasks" && <TasksPage onClose={closePanel} />}
          {activePanel === "store" && <StorePage onClose={closePanel} />}
        </SlidingPanel>
      )}
    </div>
  );
}
