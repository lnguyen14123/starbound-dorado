import React from "react";
import PottedPlant1 from '../assets/items/pottedplant_1.png';


function Plant({ tabs, currentTab}) {
  return (
    <div className="bg-transparent min-h-[80vh] w-screen ">
        <img
            src={PottedPlant1}
            alt="Bottom Banner"
            className="absolute bottom-[63vh] left-[72vw] w-[7vw] h-auto object-cover z-10 -ml-25 -mb-10 scale-110"
        />
    </div>
  );
}

export default Plant;
