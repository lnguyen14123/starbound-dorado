import React from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase"; // make sure this points to your Firebase config
import TaskbookL from '../assets/ui/L_TaskBook.png';
import BookCover from "../assets/ui/book_cover.png";
import Checkmark from "../assets/icons/checkmark.png";
import ShoppingCart from "../assets/icons/shopping_cart.png";
import Friends from "../assets/icons/friends.svg";
import Badges from "../assets/icons/badges.png";
import SettingsIcon from "../assets/icons/settings.png";
import { useTheme } from "../context/ThemeContext";

function Sidebar({ tabs, currentTab, onTabClick, 
  onSettingsClick,
  onStoreClick,
  onTasksClick,
  onFriendsClick,
  onBadgesClick,
  pendingFriendRequests = 0,
  newBadgesCount = 0
}) {
  const navigate = useNavigate();
  const { theme = "light" } = useTheme() || {};

  const buttonConfigs = [
    {
      key: "tasks",
      label: "Tasks",
      icon: Checkmark,
      onClick: onTasksClick,
      paddingClass: "pl-50",
      textExtraClass: "pr-3 pt-2 text-left",
      lightClass: "bg-[#fcd68d] border-3 border-[#daa94a]",
      darkClass: "bg-[#2e2a1f]/95 border border-[#9e854f] text-white",
      iconClass: "w-15",
    },
    {
      key: "store",
      label: "Store",
      icon: ShoppingCart,
      onClick: onStoreClick,
      paddingClass: "pl-50",
      textExtraClass: "pt-1 text-right",
      lightClass: "bg-[#b6dcff] border-3 border-[#7fb0fd]",
      darkClass: "bg-[#253242]/95 border border-[#748ab0] text-white",
      iconClass: "w-25",
    },
    {
      key: "friends",
      label: "Friends",
      icon: Friends,
      onClick: onFriendsClick,
      paddingClass: "pl-40",
      textExtraClass: "pt-1 text-right",
      lightClass: "bg-[#ffbac5] border-3 border-[#ff8395]",
      darkClass: "bg-[#3e2530]/95 border border-[#c47389] text-white",
      iconClass: "w-22",
      showFriendBadge: true,
    },
    {
      key: "badges",
      label: "Badges",
      icon: Badges,
      onClick: onBadgesClick,
      paddingClass: "pl-40",
      textExtraClass: "text-right pr-2",
      lightClass: "bg-[#fff49e] border-3 border-[#fde957]",
      darkClass: "bg-[#3d3319]/95 border border-[#b89b44] text-white",
      iconClass: "w-18",
    },
    {
      key: "settings",
      label: "Settings",
      icon: SettingsIcon,
      onClick: onSettingsClick,
      paddingClass: "pl-35",
      textExtraClass: "text-right pr-3",
      lightClass: "bg-[#d1ee80] border-3 border-[#a2c93b]",
      darkClass: "bg-[#29402a]/95 border border-[#6daf4f] text-white",
      iconClass: "w-20",
    },
  ];

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/login"); // redirect to login page
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  return (
    <div className="relative w-150 h-screen bg-transparent flex items-center justify-start">
      {/* Bottom rectangle */}
      {/* <div className="w-50 h-[85vh] bg-[#dbb9a0] border-8 border-[#524136] border-l-0 rounded-sm -ml-4 z-5"></div> */}
      <div className="absolute -ml-120 w-170 h-[95vh] z-50 flex items-center justify-center drop-shadow-[5px_5px_5px_rgba(0,0,0,.5)]">
        <img
          src={TaskbookL}
          alt="Bottom Rectangle"
          className={`w-full h-full ${theme === "dark" ? "brightness-[0.35] contrast-[1.1]" : ""}`}
        />
      </div>

      {/* Buttons container */}
      <div className="absolute -left-20 transform z-60 flex flex-col space-y-[5.5vh] ml-4">
        {buttonConfigs.map(
          ({
            key,
            label,
            icon,
            onClick,
            paddingClass,
            textExtraClass,
            lightClass,
            darkClass,
            iconClass,
            showFriendBadge,
          }) => (
            <button
              key={key}
              className={`relative w-90 h-[10vh] rounded-sm cursor-pointer flex items-center ${paddingClass} transition-all duration-200 ease-in-out hover:scale-105
          ${theme === "dark" ? darkClass : lightClass}
          drop-shadow-[4px_4px_5px_rgba(0,0,0,.4)]`}
              onClick={onClick}
            >
              <h1
                className={`font-dongle font-bold text-7xl text-white ${
                  theme === "dark" ? "opacity-80" : "opacity-100"
                } drop-shadow-[3px_3px_1px_rgba(0,0,0,.4)] ${textExtraClass}`}
              >
                {label}
              </h1>
              <img
                src={icon}
                className={`${iconClass} h-auto drop-shadow-[2px_2px_2px_rgba(0,0,0,.3)] ${
                  theme === "dark" ? "brightness-[1.1] saturate-[1.1]" : ""
                }`}
                alt={`${label} icon`}
              />
              {showFriendBadge && pendingFriendRequests > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-3xl font-bold font-dongle rounded-full w-12 h-12 flex items-center justify-center border-3 border-white drop-shadow-[2px_2px_2px_rgba(0,0,0,.5)]">
                  {pendingFriendRequests > 9 ? "9+" : pendingFriendRequests}
                </span>
              )}
            </button>
          )
        )}
      </div>

      {/* Top rectangle (overlapping) */}
      <img
        src={BookCover}
        alt="Top Rectangle"
        className={`absolute -ml-23 w-50 h-[95vh] z-70 ${
          theme === "dark" ? "brightness-[0.35] contrast-[1.5]" : ""
        }`}
      />

      {/* Top rectangle (overlapping) */}
      {/* <div className="absolute -ml-4 w-15 h-[85vh] bg-[#dbb9a0] border-8 border-[#524136] rounded-sm z-20"></div> */}
    </div>
  );
}

export default Sidebar;
