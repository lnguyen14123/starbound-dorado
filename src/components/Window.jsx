import React from "react";
import Window1 from '../assets/items/window_1.png';


function Window({ tabs, currentTab}) {
  return (
    <div className="bg-transparent min-h-[80vh] w-screen ">
        <img
            src={Window1}
            alt="Bottom Banner"
            className="absolute bottom-[62vh] left-[70vw] w-[22vw] h-auto object-cover z-0 -ml-25 -mb-10 scale-110"
        />
    </div>
  );
}

export default Window;
