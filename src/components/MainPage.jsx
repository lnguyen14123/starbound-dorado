// MainPage.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";

import { useNavigate } from "react-router-dom";
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

import HatIcon from "../assets/pets/clothing/hats/blue_cap.svg";
import CollarIcon from "../assets/pets/clothing/collars/red_collar.svg";
import FurnitureIcon from "../assets/furniture/Dresser.png";
import FloorIcon from "../assets/floors/floor_wooden.svg";
import WallsIcon from "../assets/walls/basic_wall.svg";
import PetInventory from "../assets/icons/petInventory.svg";
import FurnitureInventory from "../assets/icons/furnitureInventory.svg";

import LoadingScreen from "./LoadingScreen";


//import GrayCat1 from "../assets/gray_cat1.png";
//import YellowDog1 from "../assets/yellow_dog1.png";
import Pets from "./Pets";

import Checkmark from "../assets/icons/checkmark.png";
import StreakFire from "../assets/icons/streak_fire.png";

import { useCurrency } from "../context/CurrencyContext";
import Wall from "./Wall";
import { useTheme } from "../context/ThemeContext";

export default function MainPage() {
  const navigate = useNavigate();
  const [petType, setPetType] = useState(null);
  const [activePanel, setActivePanel] = useState(null);
  const [panelVisible, setPanelVisible] = useState(false);
  const [pendingFriendRequests, setPendingFriendRequests] = useState(0);
  const [newBadgesCount, setNewBadgesCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const { currency, setCurrency } = useCurrency();
  const latestBadgeCountRef = useRef(0);
  const { theme = "light", toggleTheme = () => {} } = useTheme() || {};

  const location = useLocation();
  const [isLoading, setIsLoading] = useState(location.state?.showLoading || true);

  // Remove your old useEffect with the 1200ms timeout
  // and replace it with:


  const mainBackgroundClass =
    theme === "dark"
      ? "bg-[#dbb9a0]"
      : "bg-[#dbb9a0]";

  const statsCardClass =
    theme === "dark"
      ? "bg-[#1f2a3f]/95 border border-[#3d4a68]"
      : "bg-[#f2be9c] border-3 border-[#7d5c47]";

  const statsTextClass =
    theme === "dark" ? "text-[#f5eedf]" : "text-[#41521b]";

  const dividerColorClass =
    theme === "dark" ? "bg-[#353f55]" : "bg-[#7d5c47]";

  const currencyBubbleClass =
    theme === "dark"
      ? "bg-[#35592d]/95 border border-[#5ca65f]"
      : "bg-[#b1d47f] border-3 border-[#5a7435]";

  const currencyTextClass =
    theme === "dark" ? "text-[#ecffdf]" : "text-white";

  const toggleButtonClasses =
    theme === "dark"
      ? "bg-white/10 text-white/90"
      : "bg-white/70 text-[#5f4637]";

  const streakIconClass =
    theme === "dark"
      ? "w-14 h-auto drop-shadow-[0_0_12px_rgba(255,140,0,0.6)]"
      : "w-14 h-auto";

  const streakIconStyle =
    theme === "dark"
      ? { filter: "brightness(1.1) saturate(1.2)" }
      : undefined;

  const inventoryButtonStyles = {
    pet:
      theme === "dark"
        ? "bg-[#553344] border border-[#a86479] text-white/90"
        : "bg-[#FFBAC5] border-[5px] border-[#FE8693]",
    furniture:
      theme === "dark"
        ? "bg-[#524225] border border-[#c59a55] text-white/90"
        : "bg-[#FCD68D] border-[5px] border-[#DAA94B]",
  };

  const storeButtonBaseClass =
    "flex items-center justify-center rounded-lg shadow-md w-28 h-[10vh] transition-transform duration-500 ease-in-out cursor-pointer pl-8 hover:translate-x-3 border";

  const storeButtonColors =
    theme === "dark"
      ? {
          base: "bg-[#2f2a35]/95 border-[#4a4354] hover:bg-[#433c4d] text-white/90",
          active: "bg-[#5d8c5f] border-[#78af81] text-white",
        }
      : {
          base: "bg-[#E4CFBD] border-[#d6b9a6] hover:bg-[#d8bfa8]",
          active: "bg-[#b1d47f] border-[#9bc060]",
        };

  const [storeCategory, setStoreCategory] = useState("Hats");

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
  const timer = setTimeout(() => {
    setIsLoading(false);
  }, 1200); // 1.2s loading screen
    
  return () => clearTimeout(timer);
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

  // Fetch new badges count
  const fetchNewBadgesCount = useCallback(async () => {
    try {
      const uid = localStorage.getItem("uid");
      if (!uid) return;

      // Get the current badge count from the database
      const response = await fetch(`/api/badges/${uid}`);
      if (response.ok) {
        const data = await response.json();
        const acquiredBadges = (data.badges || []).filter(badge => badge.acquired);
        const currentCount = acquiredBadges.length;
        latestBadgeCountRef.current = currentCount;
      // Get the last viewed count from the database
        const lastViewedKey = `lastViewedBadgeCount_${uid}`;
        const lastViewedCount = parseInt(localStorage.getItem(lastViewedKey) || "0");

        // Calculate new badges count
        const newCount = Math.max(0, currentCount - lastViewedCount);
        setNewBadgesCount(newCount);
      }
    } catch (err) {
      console.error("Error fetching new badges count:", err);
    }
  }, []);
// Fetch new badges count for notifications
useEffect(() => {
    const uid = localStorage.getItem("uid");
    if (uid) {
      const lastViewedKey = `lastViewedBadgeCount_${uid}`;
      if (!localStorage.getItem(lastViewedKey)) {
        fetch(`/api/badges/${uid}`).then(res => res.json()).then(data => {
          const acquiredBadges = (data.badges || []).filter(badge => badge.acquired);
          localStorage.setItem(lastViewedKey, acquiredBadges.length.toString());
        });
      }
    }
    
    fetchNewBadgesCount();
    const interval = setInterval(fetchNewBadgesCount, 30000);
    return () => clearInterval(interval);
  }, [fetchNewBadgesCount]);

  useEffect(() => {
    const handleBadgesUpdated = () => {
      fetchNewBadgesCount();
    };
    window.addEventListener("badgesUpdated", handleBadgesUpdated);
    return () => window.removeEventListener("badgesUpdated", handleBadgesUpdated);
  }, [fetchNewBadgesCount]);

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

  // Fetch user XP and level
  const fetchXP = async () => {
    try {
      const uid = localStorage.getItem("uid");
      if (uid) {
        const response = await fetch(`/api/user/xp?uid=${uid}`);
        const data = await response.json();
        setXp(data.progress || 0);
        setLevel(data.level || 1);
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
    }, 86400000);
    
    // Listen for task completion events to refresh streak and XP immediately
    const handleTaskCompleted = () => {
      fetchStreak();
      fetchXP();
      fetchNewBadgesCount();
    };
    window.addEventListener("taskCompleted", handleTaskCompleted);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener("taskCompleted", handleTaskCompleted);
    };
  }, [fetchNewBadgesCount]);

  function ProgressBar({ progress }) {
    const trackClass =
      theme === "dark"
        ? "bg-[#1b283d]/80 border border-[#3d4a68]"
        : "bg-[#ECF0A4] border-4 border-[#86A445]";

    const fillClass =
      theme === "dark"
        ? "bg-gradient-to-r from-[#a1d86d] via-[#7ccf73] to-[#4da35a]"
        : "bg-gradient-to-r from-[#86A445] via-[#A2C93B] to-[#7ccf73]";

    return (
<div className={`relative w-full h-[6vh] rounded-full overflow-hidden will-change-transform ${trackClass}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${fillClass}`}
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

  const markBadgesAsViewed = () => {
    const uid = localStorage.getItem("uid");
    if (!uid) return;
    const lastViewedKey = `lastViewedBadgeCount_${uid}`;
    localStorage.setItem(
      lastViewedKey,
      (latestBadgeCountRef.current || 0).toString()
    );
    setNewBadgesCount(0);
  };

  const handleFriendsClick = () => {
    setPendingFriendRequests(0);
    openPanel("friends");
  };

  const handleBadgesClick = () => {
    markBadgesAsViewed();
    openPanel("badges");
  };

  const handleBadgePanelViewed = async () => {
    await fetchNewBadgesCount();
    markBadgesAsViewed();
  };

  return (
    
    <div
      className={`grid grid-cols-[80px_1fr] h-screen w-screen relative overflow-hidden ${mainBackgroundClass}`}
    >
      {isLoading && (
        <LoadingScreen onFinish={() => setIsLoading(false)} />
      )}

      <Sidebar
        onSettingsClick={() => openPanel("settings")}
        onStoreClick={() => openPanel("store")}
        onTasksClick={() => openPanel("tasks")}
        onFriendsClick={handleFriendsClick}
        onBadgesClick={handleBadgesClick}
        pendingFriendRequests={pendingFriendRequests}
        newBadgesCount={newBadgesCount}
      />

      <div className="w-screen flex justify-center relative">
        <Wall className="-ml-20"></Wall>
        <Floor className="-ml-20" />

        <div className={`absolute top-3 left-[15vw] transform 
                        rounded-full shadow-lg z-30
                        w-7/12 h-[10vh] flex items-center px-6 gap-8 ${statsCardClass}`}>
        
          {/* Streak Section */}
          <div className="flex items-center gap-3">
            <img
              src={StreakFire}
              className={streakIconClass}
              style={streakIconStyle}
              alt="Streak flame"
            />
            <span className={`${statsTextClass} font-dongle text-6xl font-bold`}>
              {streak > 0 ? `${streak}x` : '0x'}
            </span>
          </div>

           {/* Divider */}
          <div className={`w-[3px] h-[65%] opacity-50 ${dividerColorClass}`}></div>

           {/* Level Section */}
          <span className={`${statsTextClass} font-dongle text-6xl font-bold`}>
            Lvl&nbsp;{level}
          </span>

          {/* Divider */}
          <div className={`w-[3px] h-[65%] opacity-50 ${dividerColorClass}`}></div>

          {/* XP + Bar Section */}
          <div className="flex items-center gap-3 grow">
            <span className={`${statsTextClass} font-dongle text-6xl font-bold`}>
              XP
            </span>

            <div className="flex-1">
              <ProgressBar progress={xp} />
            </div>
          </div>

          <div
            className={`absolute top-[0vh] -right-[19vw] 
                        rounded-full px-5 py-1 
                        font-dongle text-6xl 
                        shadow-2xl z-30
                        w-[16vw] h-[10vh] font-bold
                        flex items-center justify-center gap-3
                        [text-shadow:_2px_2px_0_#000,_-2px_2px_0_#000,_2px_-2px_0_#000,_-2px_-2px_0_#000]
                        ${currencyBubbleClass} ${currencyTextClass}`}
          >
            <img
              src={Checkmark}
              className="w-12 h-auto drop-shadow-[2px_2px_2px_rgba(0,0,0,.3)]"
              alt="Checkmark"
            />
<span className={`translate-y-[2px] ${currencyTextClass}`}>{currency}</span>
          </div>
        </div>

        <Window />
        <Dresser/>
        <Plant />

        <Pets petType={petType}/>
      </div>

{/* Left-side panel (Store, Friends, Badges, etc.) */}
{activePanel &&
  ["store", "friends", "badges", "settings", "tasks"].includes(activePanel) && (
    <SlidingPanel
      show={panelVisible}
      onClose={closePanel}
      title={
          activePanel === "friends"
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
      {activePanel === "badges" && (
        <BadgePage
          onClose={closePanel}
          onBadgesViewed={handleBadgePanelViewed}
        />
      )}
      {activePanel === "settings" && <SettingsPage onClose={closePanel} />}
      {activePanel === "tasks" && <TasksPage onClose={closePanel} />}
      {activePanel === "friends" && (
        <FriendsPage
          onClose={closePanel}
          onPendingRequestsChange={setPendingFriendRequests}
        />
      )}
    </SlidingPanel>
        )}
      
      {activePanel === "store" && (
      <SlidingPanel show={panelVisible} onClose={closePanel} title="Store">
        <StorePage onClose={closePanel} selectedCategory={storeCategory} />
      </SlidingPanel>
)}

{activePanel === "store" && (
  <div
    className={`absolute top-[15vh] right-[calc(50%-0px)] flex flex-col gap-3 z-48 left-160
      transition-transform duration-500 ease-in-out w-60
      ${panelVisible ? "translate-x-0" : "-translate-x-220"}`}
  >
{[
  { name: "Hats", icon: HatIcon },
  { name: "Collars", icon: CollarIcon },
  { name: "Furniture", icon: FurnitureIcon },
  { name: "Floors", icon: FloorIcon }, // NEW FLOOR TAB
  { name: "Walls", icon: WallsIcon }, // NEW FLOOR TAB
].map((cat) => (
      <button
        key={cat.name}
        onClick={() => setStoreCategory(cat.name)}
        className={`${storeButtonBaseClass} ${storeButtonColors.base} ${
          storeCategory === cat.name ? storeButtonColors.active : ""
        }`}
      >
        <img src={cat.icon} alt={cat.name} className="w-2/3 object-contain pointer-events-none" />
      </button>
    ))}
  </div>
)}

      
{/* Overlay */}
<div
  className={`absolute inset-0 bg-black z-45 transition-opacity duration-500 ${
    panelVisible ? "opacity-20" : "opacity-0 pointer-events-none"
  }`}
  onClick={closePanel}
/>



      <Inventory />
    </div>
  );
}
