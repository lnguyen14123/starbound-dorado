// MainPage.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Floor from "./Floor";

import Window from "./Window";
import Dresser from "./Dresser";
import Plant from "./Plant";
import SlidingPanel from "./SlidingPanel";
import SettingsContent from "./SettingsContent";


import GrayCat1 from "../assets/gray_cat1.png";
import YellowDog1 from "../assets/yellow_dog1.png";
import Checkmark from "../assets/checkmark.png";
import StreakFire from "../assets/streak_fire.png";

export default function MainPage() {
  const [petType, setPetType] = useState(null);
  const [activePanel, setActivePanel] = useState(null);
  const closePanel = () => setActivePanel(null);

  // activePanel can be "settings", "store", "tasks", "friends", etc.

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

  const getPetImage = () => {
    if (petType === "cat") return GrayCat1;
    if (petType === "dog") return YellowDog1;
    return null;
  };

  return (
    <div className="grid grid-cols-[80px_1fr] h-screen w-screen bg-[#dbb9a0] relative">
      <Sidebar
        onSettingsClick={() => setActivePanel("settings")}
        onStoreClick={() => setActivePanel("store")}
        onTasksClick={() => setActivePanel("tasks")}
        onFriendsClick={() => setActivePanel("friends")}
      />

        <div className="w-screen relative flex justify-center">

        <Floor />
        
        <div
        className="absolute flex top-[3vh] left-[45vw] -translate-x-1/2 
                   bg-[#f2be9c] border-3 border-[#7d5c47] 
                   rounded-full
                   drop-shadow-[3px_3px_3px_rgba(0,0,0,0.4)] z-30
                   w-[43vw] h-[9vh] items-center">
            
            <img
            src={StreakFire}
            className="w-13 ml-[1vw] h-auto drop-shadow-[2px_2px_2px_rgba(0,0,0,.3)]"
          />


            <span className="translate-y-[2px] ml-1 text-[#41521b] font-dongle text-6xl font-bold">3x</span>

            <span className="translate-y-[2px] ml-40 text-[#41521b] font-dongle text-5xl font-bold">XP</span>


            <div
                className="absolute left-[22vw]
                        bg-[#ecf0a5] border-[#86a445] border-3
                        rounded-full
                        w-[19vw] h-[4vh]">
            </div>
            <div
                    className="absolute left-[22vw]
                            bg-[#86a445] border-[#86a445] border-3
                            rounded-full
                            w-[10vw] h-[4vh]">
                </div>


          </div>

          <div
            className="absolute top-[3vh] -right-[2vw] -translate-x-1/2 
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


            <Window />
            <Dresser />
            <Plant />


        {petType && (
          <img
            src={getPetImage()}
            alt={petType}
            className={`absolute z-20  h-auto animate-bounce-slow -translate-x-[5vw]  ${
                petType === "cat" ? " top-[40vh] w-[37vw]" : petType === "dog" ? "top-[38vh] w-[27vw]" : ""
              }`}
                      />
        )}
      </div>


      <SlidingPanel
        show={!!activePanel}
        onClose={closePanel}
        title={
          activePanel === "settings"
            ? "Settings"
            : activePanel === "store"
            ? "Store"
            : activePanel === "tasks"
            ? "Tasks"
            : activePanel === "friends"
            ? "Friends"
            : ""
        }
      >
        {activePanel === "settings" && <SettingsContent onClose={closePanel} />}
        {activePanel === "store" && <StoreContent />}
        {/* add more like <TasksContent /> or <FriendsContent /> */}
      </SlidingPanel>

    </div>
  );
}
