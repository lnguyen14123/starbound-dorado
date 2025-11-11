// MainPage.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Floor from "./Floor";

import Window from "./Window";
import Dresser from "./Dresser";
import Plant from "./Plant";

// Pages
import RightSlidingPanel from "./RightSlidingPanel";
import SlidingPanel from "./SlidingPanel";
import SettingsPage from "./SettingsPage";
import BadgePage from "./BadgePage";
import FriendsPage from "./FriendsPage";
import TasksPage from "./TasksPage";
import StorePage from "./StorePage";



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
  const [pendingFriendRequests, setPendingFriendRequests] = useState(0);

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
  const handleOpenPanel = (e) => {
    const panelName = e.detail;
    setActivePanel(panelName);
    requestAnimationFrame(() => setPanelVisible(true));
  };

  window.addEventListener("openPanel", handleOpenPanel);

  return () => window.removeEventListener("openPanel", handleOpenPanel);
}, []);


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

    // Fetch pending friend requests count on mount
    const fetchPendingRequests = async () => {
      try {
        const uid = localStorage.getItem("uid");
        if (uid) {
          const response = await fetch(`/api/friends/requests/${uid}`);
          const data = await response.json();
          const requests = data.requests || [];
          setPendingFriendRequests(requests.length);
        }
      } catch (err) {
        console.error("Error fetching pending friend requests:", err);
      }
    };
    fetchPendingRequests();

    // Poll for new friend requests every 30 seconds
    const interval = setInterval(fetchPendingRequests, 30000);
    return () => clearInterval(interval);
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

  return (
    <div className="grid grid-cols-[80px_1fr] h-screen w-screen bg-[#dbb9a0] relative overflow-hidden">
      <Sidebar
        onSettingsClick={() => openPanel("settings")}
        onStoreClick={() => openPanel("store")}
        onTasksClick={() => openPanel("tasks")}
        onFriendsClick={() => openPanel("friends")}
        onBadgesClick={() => openPanel("badges")}
        pendingFriendRequests={pendingFriendRequests}
      />

      <div className="w-screen flex justify-center">
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



        <Pets petType={petType} />
      </div>

{/* Left-side panel (Store, Friends, Badges, etc.) */}
{activePanel &&
  ["store", "friends", "badges", "settings", "tasks"].includes(activePanel) && (
    <SlidingPanel
      show={panelVisible}
      onClose={closePanel}
      title={
        activePanel === "store"
          ? "Store"
          : activePanel === "friends"
          ? "Friends"
          : activePanel === "badges"
          ? "Badges"
          : activePanel === "settings"
          ? "Settings"
          : activePanel === "tasks"
          ? "Tasks"
          : ""
      }
    >
      {activePanel === "badges" && <BadgePage onClose={closePanel} />}
      {activePanel === "settings" && <SettingsPage onClose={closePanel} />}
      {activePanel === "tasks" && <TasksPage onClose={closePanel} />}
      {activePanel === "store" && <StorePage onClose={closePanel} />}
      {activePanel === "friends" && <FriendsPage onClose={closePanel} />}
    </SlidingPanel>
  )}

<RightSlidingPanel
  show={panelVisible}
  onClose={closePanel}
  title={activePanel === "furniture" ? "Furniture" :
         activePanel === "petClothes" ? "Items" : "Inventory"}
>
  {/* Buttons inside the panel */}
  <div className="absolute top-10 right-[-5vw] flex flex-col gap-4 z-50">
    <button onClick={() => openPanel("petClothes")}>
      <img src={PetInventory} alt="Pet Inventory" />
    </button>
    <button onClick={() => openPanel("furniture")}>
      <img src={FurnitureInventory} alt="Furniture Inventory" />
    </button>
  </div>

  <div className="text-5xl font-dongle text-[#4b3b2f]">
    Coming soon!
  </div>
</RightSlidingPanel>
    </div>
  );
}
