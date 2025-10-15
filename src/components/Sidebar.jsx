import React from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase"; // make sure this points to your Firebase config
import TaskbookL from '../assets/L_TaskBook.png';
import BookCover from '../assets/book_cover.png';


function Sidebar({ tabs, currentTab, onTabClick }) {

    const navigate = useNavigate();

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
    <div className="absolute -ml-120 w-auto h-[95vh] z-5 flex items-center justify-center drop-shadow-[5px_5px_5px_rgba(0,0,0,.5)]">
      <img
          src={TaskbookL}
          alt="Bottom Rectangle"
          className="w-full h-full"
        />
    </div>

    {/* Buttons container */}
    <div className="absolute -left-20 transform z-10 flex flex-col space-y-8 ml-4">

        <button className="w-90 h-21 bg-[#fcd68d] border-3 border-[#daa94a] drop-shadow-[4px_4px_5px_rgba(0,0,0,.4)]
        rounded-sm cursor-pointer">
            <h1 className="font-dongle font-bold text-7xl text-white drop-shadow-[3px_3px_1px_rgba(0,0,0,.4)] text-right pr-15">
            Tasks
            </h1>
        </button>

        <button className="w-90 h-21 bg-[#b6dcff] border-3 border-[#7fb0fd] drop-shadow-[4px_4px_5px_rgba(0,0,0,.4)]
        rounded-sm cursor-pointer">
            <h1 className="font-dongle font-bold text-7xl text-white drop-shadow-[3px_3px_1px_rgba(0,0,0,.4)] text-right pr-15">
            Store
            </h1>
        </button>

        <button className="w-90 h-21 bg-[#ffbac5] border-3 border-[#ff8395] drop-shadow-[4px_4px_5px_rgba(0,0,0,.4)]
        rounded-sm cursor-pointer">
            <h1 className="font-dongle font-bold text-7xl text-white drop-shadow-[3px_3px_1px_rgba(0,0,0,.4)] text-right pr-15">
            Friends
            </h1>
        </button>

        <button className="w-90 h-21 bg-[#fff49e] border-3 border-[#fde957]  drop-shadow-[4px_4px_5px_rgba(0,0,0,.4)]
        rounded-sm cursor-pointer">
            <h1 className="font-dongle font-bold text-7xl text-white drop-shadow-[3px_3px_1px_rgba(0,0,0,.4)] text-right pr-15">
            Settings
            </h1>
        </button>

        <button className="w-90 h-21 bg-[#d1ee80] border-3 border-[#a2c93b] drop-shadow-[4px_4px_5px_rgba(0,0,0,.4)]
        rounded-sm cursor-pointer"
        onClick={handleSignOut}
          >
          <h1 className="font-dongle font-bold text-7xl text-white drop-shadow-[3px_3px_1px_rgba(0,0,0,.4)] text-right pr-15">
          Sign Out
                      </h1>
        </button>
    </div>

    {/* Top rectangle (overlapping) */}
    <img
      src={BookCover}
      alt="Top Rectangle"
      className="absolute -ml-23 w-auto h-[95vh] z-20"
    />

    {/* Top rectangle (overlapping) */}
    {/* <div className="absolute -ml-4 w-15 h-[85vh] bg-[#dbb9a0] border-8 border-[#524136] rounded-sm z-20"></div> */}
    </div>
    


  );
}

export default Sidebar;
