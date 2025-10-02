// import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
// import PetPage from "./components/PetPage";
// import TasksPage from "./components/TasksPage";
// import StorePage from "./components/StorePage";
// import FriendsPage from "./components/FriendsPage";
// import SettingsPage from "./components/SettingsPage";
// import Sidebar from "./components/Sidebar";

// function App() {
//   return (
//     <Router>
//       <nav style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
//         <Link to="/">Pet</Link>
//         <Link to="/tasks">Tasks</Link>
//         <Link to="/store">Store</Link>
//         <Link to="/friends">Friends</Link>
//         <Link to="/settings">Settings</Link>
//       </nav>

//       <Routes>
//         <Route path="/" element={<PetPage />} />
//         <Route path="/tasks" element={<TasksPage />} />
//         <Route path="/store" element={<StorePage />} />
//         <Route path="/friends" element={<FriendsPage />} />
//         <Route path="/settings" element={<SettingsPage />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;


import React, { useState } from "react";
import Sidebar from "./components/Sidebar";

function App() {
  const tabs = ["Tasks", "Store", "Friends", "Settings"];
  const [currentTab, setCurrentTab] = useState("Tasks");

  return (
    <div className="grid grid-cols-[80px_1fr] h-screen w-screen bg-white">
      <Sidebar
        tabs={tabs}
        currentTab={currentTab}
        onTabClick={setCurrentTab}
        className="bg-white text-black"
      />

      {/* <div className="flex-1 p-6 bg-transparent">
        <h1 className="text-2xl font-bold mb-4 text-black">{currentTab} Page</h1>
      </div> */}
    </div>
  );
}

export default App;
