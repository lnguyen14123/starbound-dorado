import React from "react";

export default function StorePage({ onClose }) {
  return (
    <div className="w-[40vw] h-[80vh] mt-[1vh] p-1">
      {/* Main light beige container */}
      <div className="-ml-2 w-[33vw] h-full bg-[#F1E2D4] rounded-2xl p-3">
        {/* 2x3 Grid container */}
        <div className="grid grid-cols-2 gap-3 w-full h-full p-1">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="bg-[#E4CFBD] rounded-2xl w-full h-[23vh] shadow-md hover:shadow-lg transition-shadow duration-300"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}
