import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Floor from "./components/Floor"
import Notebook from "./components/Notebook";



import Login from "./components/Login";
import Register from "./components/Register";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";


function App() {
  const tabs = ["Tasks", "Store", "Friends", "Settings"];
  const [currentTab, setCurrentTab] = useState("Tasks");

  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  if (!user) {
    // Show login/register if not logged in
    return (

      <div className="grid grid-cols-[80px_1fr] h-screen w-screen bg-[#dbb9a0]">

        
        {/* <Notebook></Notebook> */}
        <Login />
        {/* <Register /> */}

      <Floor></Floor>

    </div>
    );
  }

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
