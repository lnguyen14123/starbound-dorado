import React, { Children } from "react";
import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import "../index.css";

import { useTheme } from "../context/ThemeContext";
import toggleTab from "../assets/ui/toggle_tab.svg";
import userIc from "../assets/icons/User.svg";
import musicIc from "../assets/icons/Music.svg";
import bellIc from "../assets/icons/Bell.svg";
import eyeIc from "../assets/icons/Eye.svg";

{/* General Settings Item */}
function AccordionItem({ id, title, icon, openId, setOpenId, children }) {
  const isOpen = openId === id;
  const { theme = "light" } = useTheme() || {};
  const handleToggle = () => setOpenId(isOpen ? null : id);
  const panelClasses =
    theme === "dark"
      ? "bg-[#1f2434]/90 border border-[#353a52] text-[#f5ede1]"
      : "bg-[#ead4c3] border-[3px] border-[#e3cfbf] text-[#4b3b2f]";

  return (
    <div className={`border-[3px] rounded-[1.5rem] px-8 py-[6px] font-bold mt-4 ${panelClasses}`}>
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-controls={`sect-${id}`}
        className="flex justify-between items-center w-full text-left cursor-pointer focus:outline-none"
      >
        <div className="p-1 flex items-center gap-3 text-4xl font-semibold">
          {icon && (
            <img
              src={icon}
              alt=""
              className={`w-8 ${theme === "dark" ? "brightness-[1.2] saturate-[0.3]" : ""}`}
            />
          )}
          {title}
        </div>

        {/* Icon still rotates, but no longer handles the click logic */}
        <div
          className={`transition-transform duration-200 ${
            isOpen ? "rotate-0" : "rotate-180"
          } ${theme === "dark" ? "brightness-[1.8] saturate-[0.3]" : ""}`}
        >
          <img src={toggleTab} alt="toggle selection" className="w-8 h-8" />
        </div>
      </button>

      {/* Content section */}
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
  const { theme, toggleTheme, setTheme } = useTheme();
  const [openId, setOpenId] = useState(null);
  const pageTextClass = theme === "dark" ? "text-[#f5ede1]" : "text-[#4b3b2f]";
  const signOutButtonClasses =
    theme === "dark"
      ? "bg-[#2f4d2f] hover:bg-[#467346] border border-[#6daf4f] text-white text-opacity-50"
      : "bg-[#d1ee80] hover:bg-[#b9d66b] border-3 border-[#a2c93b] text-white";

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

    {
      id: "appearance",
      title: "Appearance",
      icon: eyeIc,
      content: (
        <div className="flex items-center justify-between text-3xl">
          <span>Dark mode</span>
          <button
            onClick={toggleTheme}
            className={`px-6 py-2 rounded-full font-semibold transition cursor-pointer ${
              theme === "dark"
                ? "bg-[#2f4d2f] text-[#ecffdf] hover:bg-[#467346] border border-[#6daf4f]"
                : "bg-[#d1ee80] text-[#41521b] hover:bg-[#b9d66b] border border-[#a2c93b]"
            }`}
          >
            {theme === "dark" ? "On" : "Off"}
          </button>
        </div>
      ),
    }
  ];

  return (
    <div className={pageTextClass}>
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
          className={`absolute bottom-20 w-110 text-4xl font-bold rounded-2xl drop-shadow-[3px_3px_3px_rgba(0,0,0,0.3)] py-2 transition cursor-pointer ${signOutButtonClasses}`}
        >
          Sign Out
        </button>
    </div>
  );
}
