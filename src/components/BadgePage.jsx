import React from "react";

export default function BadgePage({ onClose }) {
  return (
    <div className="w-full h-[80vh] mt-[1vh] p-4 flex justify-center">
      {/* Main light beige container */}
      <div className="w-[100%] h-full bg-[#F1E2D4] rounded-2xl p-3">
        {/* 3x3 Grid container */}
        <div className="grid grid-cols-3 gap-4 w-full h-full p-1">
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
