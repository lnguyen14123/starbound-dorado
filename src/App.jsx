import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import MainPage from "./components/MainPage";
import Floor from "./components/Floor";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./components/Login";
import Register from "./components/Register";

import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import ChoosePet from "./components/ChoosePet";
import TasksPage from "./components/TasksPage";

function App() {
  const tabs = ["Tasks", "Store", "Friends", "Settings"];
  const [currentTab, setCurrentTab] = useState("Tasks");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // new
  const [isNewUser, setIsNewUser] = useState(null); // start as null

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      // Store Firebase auth uid in localStorage when user is logged in
      if (currentUser) {
        localStorage.setItem("uid", currentUser.uid);
      } else {
        localStorage.removeItem("uid");
      }

      const stored = localStorage.getItem("isNewUser");
      setIsNewUser(stored === "true");

      setLoading(false);
    });

    return unsubscribe;
  }, []);


  if (loading || isNewUser === null) {

    return (
      <div className="h-screen w-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }
      


  return (
    <Router>
      <Routes>
      {/* Public routes */}
      <Route path="/login" element={!user ? <Layout><Login /></Layout> : <Navigate to="/" />} />
      <Route path="/register" element={!user ? <Layout><Register /></Layout> : <Navigate to="/ChoosePet" />} />

  {/* Protected routes */}
  {user && isNewUser && (
    <Route
      path="/*"
      element={<Navigate to="/ChoosePet" replace />}
    />
  )}

<Route
  path="/"
  element={
    <ProtectedRoute user={user} loading={loading}>
      {isNewUser ? <Navigate to="/ChoosePet" replace /> : <MainPage />}
    </ProtectedRoute>
  }
/>

  <Route
    path="/ChoosePet"
    element={
      <ProtectedRoute user={user} loading={loading}>
        <div className="grid grid-cols-[80px_1fr] h-screen w-screen bg-[#dbb9a0]">
          <ChoosePet setIsNewUser={setIsNewUser} />
          <Floor />
        </div>
      </ProtectedRoute>
    }
  />

  <Route
    path="/tasks"
    element={
      <ProtectedRoute user={user} loading={loading}>
        <TasksPage />
      </ProtectedRoute>
    }
  />

      </Routes>
    </Router>
  );
}

export default App;