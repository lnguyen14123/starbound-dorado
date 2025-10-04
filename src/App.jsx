import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Floor from "./components/Floor";
import Notebook from "./components/Notebook";
import Layout from "./components/Layout";

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

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            !user ? (
              <Layout>
                <Login />
              </Layout>
            ) : (<Navigate to="/" />)}
        />
              
        <Route
          path="/register"
          element={
            !user ? (
              <Layout>
                <Register />
              </Layout>
            ) : (
              <Navigate to="/" />
            )
          }
        />


        {/* Protected routes */}
        <Route
          path="/"
          element={
            user ? (
              <div className="grid grid-cols-[80px_1fr] h-screen w-screen bg-[#dbb9a0]">
                <Sidebar
                  tabs={tabs}
                  currentTab={currentTab}
                  onTabClick={setCurrentTab}
                  className="bg-white text-black"
                />
                <Floor />
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;