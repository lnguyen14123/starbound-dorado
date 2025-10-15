// MainPage.jsx
import React from "react";
import Sidebar from "./Sidebar";
import Floor from "./Floor";

export default function MainPage() {
  return (
    <div className="grid grid-cols-[80px_1fr] h-screen w-screen bg-[#dbb9a0]">
      <Sidebar />
      <Floor />
    </div>
  );
}
    