import React from "react";
import Dresser1 from '../assets/items/dresser_1.png';


function Dresser({ tabs, currentTab}) {
  return (
    <div className="bg-transparent min-h-[80vh] w-screen ">
        <img
            src={Dresser1}
            alt="Bottom Banner"
            className="absolute bottom-[27vh] left-[62vw] w-[18vw] h-auto object-cover z-10 -ml-25 -mb-10 scale-110"
        />
    </div>
  );
}

export default Dresser;
