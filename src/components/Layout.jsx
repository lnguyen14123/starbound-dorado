import React from "react";
import Floor from "./Floor";

import GrayCat1 from "../assets/gray_cat1.png"
import YellowDog1 from "../assets/yellow_dog1.png"

function Layout({ children }) {
  return (

<div className="relative h-screen w-screen overflow-hidden bg-[#dbb9a0]">
  {/* Background images */}
        
  <img
            src={GrayCat1}
            className="absolute bottom-1/20 left-1/20 w-2/6 h-auto z-10"
            alt="Gray Cat"
        />

<img
            src={YellowDog1}
            className="absolute bottom-1/20 right-1/27 w-1/4 h-auto z-10"
            alt="Gray Cat"
        />


{/* 
        <div
            className="absolute top-10 left-20 h-1/2 w-1/2 bg-cover opacity-50"
            style={{ backgroundImage: `url(${BG2})` }}
        ></div>

        <div
            className="absolute bottom-0 right-0 h-1/3 w-1/3 bg-cover opacity-40"
            style={{ backgroundImage: `url(${BG3})` }}
        ></div>  */}

        {/* Foreground content */}
        <div className="relative grid grid-cols-[80px_1fr] h-full w-full">
            {children}
            <Floor />
        </div>
</div>

  );
}

export default Layout;
