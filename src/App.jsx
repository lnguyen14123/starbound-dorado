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
import ChoosePet from "./components/ChoosePet";

function App() {
  const tabs = ["Tasks", "Store", "Friends", "Settings"];
  const [currentTab, setCurrentTab] = useState("Tasks");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // new

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); // auth state is now known
    });
    return unsubscribe;
  }, []);

  if (loading) {
    // show nothing or a spinner while Firebase checks auth
    return <div className="h-screen w-screen flex items-center justify-center">Loading...</div>;
  }


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

        <Route
          path="/ChoosePet"
          element={
            user ? (
              <div className="grid grid-cols-[80px_1fr] h-screen w-screen bg-[#dbb9a0]">
                <ChoosePet/>
                <Floor/>
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