import React, { Children } from "react";
import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import "../index.css";

import toggleTab from "../assets/toggle_tab.svg";
import userIc from "../assets/icons/User.svg";
import musicIc from "../assets/icons/Music.svg";
import bellIc from "../assets/icons/Bell.svg";

{/* General Settings Item */}
function AccordionItem({ id, title, icon, openId, setOpenId, children}) {
  const isOpen = openId === id;
  return (
    <div className="panel-card">
      <div className="flex justify-between items-center">
        <div className="p-1 flex items-center gap-3 text-4xl font-semibold">
          {icon && <img src={icon} alt="" className="w-8" />}
          {title}
        </div>

        <button
          aria-expanded={isOpen}
          aria-controls={`sect-${id}`}
          onClick={() => setOpenId(isOpen ? null : id)}
          className={`transition-transform duration-200 cursor-pointer ${isOpen ? "rotate-0" : "rotate-180"}`}
        >
          <img src={toggleTab} alt="toggle selection" className="w-8 h-8"/>
        </button>

      </div>

      <div
        id={`sect-${id}`}
        className={`overflow-hidden transition-all duration-500 ease-in-out
        ${isOpen ? "max-h-96 mt-4" : "max-h-0"}`}
      >
        {children}
      </div>
    </div>
  );
}

export default function SettingsPage({ onClose }) {
  const [openId, setOpenId] = useState(null);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      onClose?.();
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  {/* List of Setting Dropdown */}
  const sections = [
    {
      id: "account",
      title: "Account",
      icon: userIc,
      content: (
        <div className="grid grid-cols-2 gap-y-3 text-3xl mt-2">
          <span>Username</span>
          <span>Email</span>
          <button className="col-span-2 underline font-semibold hover:text-[#886b52] text-left">
            Change Password
          </button>
        </div>
      ),
    },

    {
      id: "sound",
      title: "Sound",
      icon: musicIc,
      content: (
        <div className="grid grid-cols-2 gap-y-3 text-3xl mt-2">
          <span>Master Volume</span>
          <input type="range" min="0" max="100" defaultValue="70" className="w-full accent-[#a2c93b]"/>
          <label className="col-span-2 flex items-center gap-3 text-2xl mt-2">
            <input type="checkbox" className="accent-[#a2c93b] dark:accent-[#c9eb6b]" defaultChecked/> UI sounds
          </label>
        </div>
      ),
    },

    {
      id: "notifications",
      title: "Notifications",
      icon: bellIc,
      content: (
        <div className="grid grid-cols-2 gap-y-3 text-3xl mt-2">
          <span>Daily reminders</span>
          <label className="text-right">
            <input type="checkbox" className="accent-[#a2c93b] dark:accent-[#c9eb6b] mr-2"/> On
          </label>
          <span>Task streak notifs</span>
          <label className="text-right">
            <input type="checkbox" className="accent-[#a2c93b] dark:accent-[#c9eb6b] mr-2"/> Off
          </label>
        </div>
      ),
    },
  ];

  return (
    <div className="">
      <div>
        {sections.map(({ id, title, icon, content }) => (
        <AccordionItem
          key={id}
          id={id}
          title={title}
          icon={icon}
          openId={openId}
          setOpenId={setOpenId}
        >
          {content}
        </AccordionItem>
      ))}
      </div>
      
      <button
          onClick={handleSignOut}
          className="absolute bottom-10 left-1/2 -translate-x-[8vw] w-[20vw] bg-[#d1ee80] hover:bg-[#b9d66b] border-3 border-[#a2c93b]
                    text-4xl font-bold text-white rounded-2xl drop-shadow-[3px_3px_3px_rgba(0,0,0,0.3)] py-2 transition"
        >
          Sign Out
        </button>
    </div>
  );
}
