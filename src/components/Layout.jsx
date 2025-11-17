import React, { useState } from "react";
import Floor from "./Floor";

import GrayCat1 from "../assets/ui/gray_cat1.png"
import YellowDog1 from "../assets/ui/yellow_dog1.png"

import Window from "../assets/items/window_1.png"
import Dresser from "../assets/items/dresser_1.png"

import TitleScreen from "./TitleScreen";

function Layout({ children }) {
  const [showTitleScreen, setShowTitleScreen] = useState(true);

  const dismissTitleScreen = () => setShowTitleScreen(false);

  return (

<div className="relative h-screen w-screen overflow-hidden bg-[#dbb9a0]">
  {/* Background images */}
        
      
            <img
        src={Window}
        className="absolute top-[12vh] left-[11vw] h-[20vw] z-0 opacity-100"
        alt="Window"
      />

      <img
        src={Dresser}
        className="absolute bottom-[17vh] right-[12vw] h-[35vh] z-10 opacity-100"
        alt="Dresser"
      />

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

        {/* Foreground content */}
        <div className="relative grid grid-cols-[80px_1fr] h-full w-full">
            {children}
            <Floor />
        </div>
        <TitleScreen show={showTitleScreen} onDismiss={dismissTitleScreen} />
</div>

  );
}

export default Layout;
