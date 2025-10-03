

import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Floor from "./components/Floor"


function App() {
  const tabs = ["Tasks", "Store", "Friends", "Settings"];
  const [currentTab, setCurrentTab] = useState("Tasks");

  return (
    <div className="grid grid-cols-[80px_1fr] h-screen w-screen bg-[#dbb9a0]">
      <Sidebar
        tabs={tabs}
        currentTab={currentTab}
        onTabClick={setCurrentTab}
        className="bg-white text-black"
      />

      <Floor></Floor>

    </div>
  );
}

export default App;
