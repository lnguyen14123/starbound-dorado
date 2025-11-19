import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

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
import CustomizePage from "./components/CustomizePage";

import { CurrencyProvider } from "./context/CurrencyContext";
import { EquippedProvider } from "./context/EquippedContext";
import { ThemeProvider } from "./context/ThemeContext";

import LoadingScreen from "./components/LoadingScreen";


function App() {
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
      return <LoadingScreen />;
  }

  return (
    <ThemeProvider>
    <EquippedProvider>
    <CurrencyProvider>
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
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/register"
            element={
              !user ? (
                <Layout>
                  <Register />
                </Layout>
              ) : (
                <Navigate to="/ChoosePet" />
              )
            }
          />

<Route
  path="/"
  element={
    <ProtectedRoute user={user} loading={loading}>
      {(!user || loading) ? null : (
        // Check backend/localStorage for pet
        !localStorage.getItem("petType") ? (
          <Navigate to="/ChoosePet" replace />
        ) : (
          <MainPage />
        )
      )}
    </ProtectedRoute>
  }
/>

<Route
  path="/ChoosePet"
  element={
    <ProtectedRoute user={user} loading={loading}>
      <ChoosePet setIsNewUser={setIsNewUser} />
    </ProtectedRoute>
  }
/>

        </Routes>
      </Router>
      </CurrencyProvider>
      </EquippedProvider>
      </ThemeProvider>
  );
}

export default App;
