import React from "react";
import Floor1 from '../assets/Floor1.png';

function Floor({ className = "", tabs, currentTab, onTabClick }) {
  return (


    <div className="bg-transparent w-screen bg-black">

      {/* Bottom banner image */}
      <img
        src={Floor1}
        alt="Bottom Banner"
        className={`absolute bottom-0 left-0 w-screen h-[30vh] z-0 -mb-10 scale-105 ${className}`}
      />
    </div>
  );
}

export default Floor;
