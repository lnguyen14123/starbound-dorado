import React, { Children, useEffect, useRef, useState } from "react";
import { onAuthStateChanged, sendPasswordResetEmail, signOut } from "firebase/auth";
import { auth } from "../firebase";
import "../index.css";

import { useTheme } from "../context/ThemeContext";
import { useSoundSettings } from "../context/SoundContext";
import toggleTab from "../assets/ui/toggle_tab.svg";
import userIc from "../assets/icons/User.svg";
import musicIc from "../assets/icons/Music.svg";
import bellIc from "../assets/icons/Bell.svg";
import eyeIc from "../assets/icons/Eye.svg";
import lightSwitchSfx from "../assets/sounds/light-switch.mp3";

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
  const { theme, toggleTheme } = useTheme();
  const {
    masterVolume,
    setMasterVolume,
    sfxVolume,
    setSfxVolume,
    petVolume,
    setPetVolume,
  } = useSoundSettings();
  const [openId, setOpenId] = useState(null);
  const [accountEmail, setAccountEmail] = useState("");
  const [accountName, setAccountName] = useState("");
  const lightSwitchRef = useRef(null);
  const pageTextClass = theme === "dark" ? "text-[#f5ede1]" : "text-[#4b3b2f]";
  const signOutButtonClasses =
    theme === "dark"
      ? "bg-[#2f4d2f] hover:bg-[#467346] border border-[#6daf4f] text-white text-opacity-50"
      : "bg-[#d1ee80] hover:bg-[#b9d66b] border-3 border-[#a2c93b] text-white";
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    lightSwitchRef.current = new Audio(lightSwitchSfx);
    return () => lightSwitchRef.current?.pause();
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        const email = user.email || "";
        const localName = localStorage.getItem("username") || "";
        const derivedName =
          user.displayName || localName || (email ? email.split("@")[0] : "");

        setAccountEmail(email);
        setAccountName(derivedName);
      } else {
        setAccountEmail("");
        setAccountName("");
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (lightSwitchRef.current) {
      lightSwitchRef.current.volume =
        0.6 * (masterVolume ?? 1) * (sfxVolume ?? 1);
    }
  }, [masterVolume, sfxVolume]);

  const playLightSwitch = () => {
    if (!lightSwitchRef.current) return;
    lightSwitchRef.current.currentTime = 0;
    lightSwitchRef.current.play();
  };

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
          <span>{accountName || "Unknown"}</span>
          <span>Email</span>
          <span className="break-all">{accountEmail || "Unknown"}</span>
          <button
            className="col-span-2 underline font-semibold hover:text-[#886b52] text-left cursor-pointer"
          >
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
          <input
            type="range"
            min="0"
            max="100"
            value={Math.round((masterVolume ?? 0) * 100)}
            onChange={(e) => setMasterVolume(Number(e.target.value) / 100)}
            className="w-full accent-[#a2c93b]"
          />
          <span>SFX Volume</span>
          <input
            type="range"
            min="0"
            max="100"
            value={Math.round((sfxVolume ?? 0) * 100)}
            onChange={(e) => setSfxVolume(Number(e.target.value) / 100)}
            className="w-full accent-[#a2c93b]"
          />
          <span>Pet Volume</span>
          <input
            type="range"
            min="0"
            max="100"
            value={Math.round((petVolume ?? 0) * 100)}
            onChange={(e) => setPetVolume(Number(e.target.value) / 100)}
            className="w-full accent-[#a2c93b]"
          />
        </div>
      ),
    },

    {
      id: "notifications",
      title: "Notifications",
      icon: bellIc,
      content: (
        <div className="flex items-center justify-between text-3xl">
          <span>Notifications</span>
          <button
            onClick={() => setNotificationsEnabled((prev) => !prev)}
            className={`px-6 py-2 rounded-full font-semibold transition cursor-pointer ${
              theme === "dark"
                ? "bg-[#2f4d2f] text-[#ecffdf] hover:bg-[#467346] border border-[#6daf4f]"
                : "bg-[#d1ee80] text-[#41521b] hover:bg-[#b9d66b] border border-[#a2c93b]"
            }`}
          >
            {notificationsEnabled ? "On" : "Off"}
          </button>
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
            onClick={() => {
              playLightSwitch();
              toggleTheme();
            }}
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
          className={`absolute bottom-9 w-110 text-4xl font-bold rounded-2xl drop-shadow-[3px_3px_3px_rgba(0,0,0,0.3)] py-2 transition cursor-pointer ${signOutButtonClasses}`}
        >
          Sign Out
        </button>
    </div>
  );
}
