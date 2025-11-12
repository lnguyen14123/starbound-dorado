import React from "react";
import Floor1 from '../assets/Floor1.png';

function Floor({ tabs, currentTab, onTabClick }) {
  return (


    <div className="bg-transparent w-full">

    {/* Bottom banner image */}
    <img
        src={Floor1}
        alt="Bottom Banner"
        className="absolute bottom-0 left-0 w-full h-70 z-0 -ml-2 -mb-10 scale-105"
    />
    </div>
  );
}

export default Floor;
