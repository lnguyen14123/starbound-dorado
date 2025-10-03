import React from "react";

function Sidebar({ tabs, currentTab, onTabClick }) {
  return (

    // <div className="relative w-70 my-0 h-screen bg-transparent flex items-center justify-start">
    // {/* Bottom rectangle */}
    //     <div className="w-50 h-[85vh] bg-[#d6ae92] border-8 border-[#524136] border-l-0 rounded-sm -ml-4"></div>

    // {/* Top rectangle (overlapping) */}
    //     <div className="absolute -ml-4 w-15 h-[85vh] bg-[#d6ae92] border-8 border-[#524136] rounded-sm"></div>

    // </div>

    <div className="relative w-70 h-screen bg-transparent flex items-center justify-start">

    {/* Bottom rectangle */}
    <div className="w-50 h-[85vh] bg-[#dbb9a0] border-8 border-[#524136] border-l-0 rounded-sm -ml-4"></div>

    {/* Buttons container */}
    <div className="absolute left-0 transform z-10 flex flex-col space-y-6 ml-4">

        <button className="w-62 h-25 bg-[#fcd68d] border-7 border-[#daa94a] 
        rounded-sm cursor-pointer">
            <h1 className="font-dynapuff text-4xl text-white drop-shadow-[-3px_3px_0px_rgba(0,0,0)]">
            Tasks
            </h1>
        </button>

        <button className="w-62 h-25 bg-[#b6dcff] border-7 border-[#7fb0fd] 
        rounded-sm cursor-pointer">
            <h1 className="font-dynapuff text-4xl text-white drop-shadow-[-3px_3px_0px_rgba(0,0,0)]">
            Store
            </h1>
        </button>

        <button className="w-62 h-25 bg-[#ffbac5] border-7 border-[#ff8395] 
        rounded-sm cursor-pointer">
            <h1 className="font-dynapuff text-4xl text-white drop-shadow-[-3px_3px_0px_rgba(0,0,0)]">
            Friends
            </h1>
        </button>

        <button className="w-62 h-25 bg-[#d1ee80] border-7 border-[#a2c93b] 
        rounded-sm cursor-pointer">
            <h1 className="font-dynapuff text-4xl text-white drop-shadow-[-3px_3px_0px_rgba(0,0,0)]">
            Settings
            </h1>
        </button>


    </div>

    {/* Top rectangle (overlapping) */}
    <div className="absolute -ml-4 w-15 h-[85vh] bg-[#dbb9a0] border-8 border-[#524136] rounded-sm z-20"></div>
    </div>


  );
}

export default Sidebar;
