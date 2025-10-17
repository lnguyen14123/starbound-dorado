import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function SettingsContent({ onClose }) {
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      onClose();
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  return (
    <div className="">
      <p>Sound: On</p>
      <p>Notifications: Off</p>
      <p>Theme: Light</p>

      <button
        onClick={handleSignOut}
        className="mt-12 w-[20vw] bg-[#d1ee80] hover:bg-[#b9d66b] border-3 border-[#a2c93b]
                   text-6xl text-white rounded-md drop-shadow-[3px_3px_3px_rgba(0,0,0,0.3)] py-3 transition"
      >
        Sign Out
      </button>
    </div>
  );
}
