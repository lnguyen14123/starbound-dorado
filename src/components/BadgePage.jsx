import React from "react";

export default function BadgePage({ onClose }) {
  return (
    <div className="w-[33vw] h-[80vh] mt-[1vh] p-1">
      {/* Main light beige container */}
      <div className="w-[30vw] h-full bg-[#F1E2D4] rounded-2xl p-3">
        {/* 3x3 Grid container */}
        <div className="grid grid-cols-3 gap-2 w-full h-full p-1">
          {/* Generate 12 light brown squares for 3x4 grid */}
          {[...Array(12)].map((_, index) => (
            <div
              key={index}
              className="bg-[#E4CFBD] rounded-2xl w-full aspect-square shadow-md hover:shadow-lg transition-shadow duration-300"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}
