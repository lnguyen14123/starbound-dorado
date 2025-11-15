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
import FriendsPage from "./FriendsPage";
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
import { useNavigate } from "react-router-dom";

export default function MainPage() {
  const navigate = useNavigate();
  const [petType, setPetType] = useState(null);
  const [activePanel, setActivePanel] = useState(null);
  const [panelVisible, setPanelVisible] = useState(false);
  const [pendingFriendRequests, setPendingFriendRequests] = useState(0);
  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(0);
  const [currency, setCurrency] = useState(0);

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
  async function fetchCurrency() {
    const uid = localStorage.getItem("uid");
    const res = await fetch("api/user/currency", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid }),
    });

    const data = await res.json();
    setCurrency(data.currency);   // store it
  }

  fetchCurrency();
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

  // Fetch user streak
  const fetchStreak = async () => {
    try {
      const uid = localStorage.getItem("uid");
      if (uid) {
        const response = await fetch(`/api/tasks/streak?uid=${uid}`);
        const data = await response.json();
        console.log("Streak data:", data); 
        setStreak(data.streak || 0);
      }
    } catch (err) {
      console.error("Error fetching streak:", err);
    }
  };

  // Fetch user XP
  const fetchXP = async () => {
    try {
      const uid = localStorage.getItem("uid");
      if (uid) {
        const response = await fetch(`/api/user/xp?uid=${uid}`);
        const data = await response.json();
        setXp(data.progress || 0);
      }
    } catch (err) {
      console.error("Error fetching XP:", err);
    }
  };

  useEffect(() => {
    fetchStreak();
    fetchXP();
    const interval = setInterval(() => {
      fetchStreak();
      fetchXP();
    }, 300000); 
    
    // Listen for task completion events to refresh streak and XP immediately
    const handleTaskCompleted = () => {
      fetchStreak();
      fetchXP();
    };
    window.addEventListener("taskCompleted", handleTaskCompleted);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener("taskCompleted", handleTaskCompleted);
    };
  }, []);

  function ProgressBar({ progress }) {
    return (
<div className="relative w-full h-[6vh] bg-[#ECF0A4] border-4 border-[#86A445] rounded-full overflow-hidden will-change-transform">
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
        pendingFriendRequests={pendingFriendRequests}
      />

      <div className="w-screen flex justify-center relative">
        <Floor />

        <div className="absolute top-3 left-[15vw] transform 
                        bg-[#f2be9c] border-3 border-[#7d5c47] 
                        rounded-full shadow-lg z-30
                        w-7/12 h-[10vh] flex items-center px-6 gap-8">
        
          {/* Streak Section */}
          <div className="flex items-center gap-3">
            <img src={StreakFire} className="w-14 h-auto" />
            <span className="text-[#41521b] font-dongle text-6xl font-bold">
              {streak > 0 ? `${streak}x` : '0x'}
            </span>
          </div>

          {/* Divider */}
          <div className="w-[3px] h-[65%] bg-[#7d5c47] opacity-50"></div>

          {/* XP + Bar Section */}
          <div className="flex items-center gap-3 grow">
            <span className="text-[#41521b] font-dongle text-6xl font-bold">
              XP
            </span>

            <div className="flex-1">
              <ProgressBar progress={xp} />
            </div>
          </div>

          <div
            className="absolute top-[0vh] -right-[19vw] 
                        bg-[#b1d47f] border-3 border-[#5a7435] 
                        rounded-full px-5 py-1 
                        text-white font-dongle text-6xl 
                        shadow-2xl z-30
                        w-[16vw] h-[10vh] font-bold
                        flex items-center justify-center gap-3
                        [text-shadow:_2px_2px_0_#000,_-2px_2px_0_#000,_2px_-2px_0_#000,_-2px_-2px_0_#000]"
          >
            <img
              src={Checkmark}
              className="w-12 h-auto drop-shadow-[2px_2px_2px_rgba(0,0,0,.3)]"
              alt="Checkmark"
            />
<span className="translate-y-[2px]">{currency}</span>
          </div>
        </div>

        <Window />
        <Dresser/>
        <Plant />

        <Pets
          petType={petType}
        />

        {renderInventoryButtons("right-[3vw] top-[20vh]")}
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

      <Inventory />
    </div>
  );
}
