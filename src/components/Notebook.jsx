import React from "react";
import { useNavigate } from "react-router-dom";
import TaskbookL from '../assets/ui/L_TaskBook.png';
import { useTheme } from "../context/ThemeContext";

function Notebook({ children }) {
  const navigate = useNavigate();
  const { theme = "light" } = useTheme() || {};

  return (
    <div className="relative bg-transparent min-h-[100vh] min-w-[100vw] flex items-center justify-center">

      {/* Container for notebook + buttons */}
      <div className="relative flex items-center justify-center">

        {/* Buttons under the notebook */}
        <div className="absolute right-[-2rem] z-10 flex flex-col gap-4 top-1/5">
          <button
            className="text-right cursor-pointer bg-[#ffbac4] text-4xl font-dongle font-bold text-white pl-6 border-[#fe8693] border-3 pr-3 py-1 rounded-r-sm shadow-md hover:bg-[#fe8693] transition"
            onClick={() => navigate("/login")}
          >
            Login
          </button>

          <button
            className="text-right cursor-pointer bg-[#ffbac4] text-4xl font-bold font-dongle text-white pl-10 pr-3 py-1 border-[#fe8693] border-3 rounded-r-sm shadow-md hover:bg-[#fe8693] transition"
            onClick={() => navigate("/register")}
          >
            Sign Up
          </button>
        </div>

        {/* Notebook image */}
        <img
          src={TaskbookL}
          alt="Notebook"
          className={`h-[110vh] z-20 scale-80 drop-shadow-[-10px_10px_10px_rgba(0,0,0,0.5)]
            ${theme === "dark" ? "brightness-[0.6] contrast-[1.2]" : ""}`}
        />

        {/* Children container on top of notebook */}
        <div className="absolute z-30 flex justify-center items-center w-135 h-155 translate-x-[2.3vw]">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Notebook;
