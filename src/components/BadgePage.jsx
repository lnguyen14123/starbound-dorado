import React from "react";

export default function BadgePage({ onClose }) {
  return (
    <div className="w-133 h-[calc(100vh-170px)] mt-[1vh] p-1 overflow-y-auto">
      {/* Main light beige container */}
      <div className="w-full bg-[#F1E2D4] rounded-2xl p-3">
        {/* 3x3 Grid container */}
        <div className="grid grid-cols-3 gap-4 w-full p-1">
          {[...Array(12)].map((_, index) => ( // try 20 to test scrolling
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
