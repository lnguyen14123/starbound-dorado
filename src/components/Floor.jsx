import React from "react";
import Floor1 from '../assets/Floor1.png';

function Floor({ tabs, currentTab, onTabClick }) {
  return (
    <div className="bg-transparent min-h-[80vh] w-screen ">
        <img
            src={Floor1}
            alt="Bottom Banner"
            className="absolute bottom-0 left-0 w-screen h-auto object-cover z-0 -ml-25 -mb-10 scale-110"
        />
    </div>
  );
}

export default Floor;
