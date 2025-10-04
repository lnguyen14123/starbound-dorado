import React from "react";
import Floor from "./Floor";

function Layout({ children }) {
  return (
    <div className="grid grid-cols-[80px_1fr] h-screen w-screen bg-[#dbb9a0]">
      {children}
      <Floor />
    </div>
  );
}

export default Layout;
