import React from "react";
import Checkmark from "../assets/checkmark.png";

export default function StorePage({ onClose }) {
  return (
    <div className="w-125 h-[78vh] mt-[1vh] items-center justify-center">
      {/* Main light beige container */}
      <div className="w-full h-full bg-[#F1E2D4] rounded-2xl p-3 overflow-hidden flex flex-col">
        {/* 2x5 Grid container with scrolling */}
        <div className="grid grid-cols-2 gap-2 w-full p-1 overflow-y-auto overflow-x-hidden min-h-0 flex-1">
          {/* Generate 10 light brown rectangles for 2x5 grid */}
          {[...Array(10)].map((_, index) => (
            <div
              key={index}
              className="bg-[#E4CFBD] rounded-2xl w-full aspect-[4/3] shadow-md hover:shadow-lg transition-shadow duration-300 relative"
            >
              {/* Buy button */}
              <button className="absolute bottom-2 left-5 right-5 bg-[#b6e5b6] hover:bg-[#a8d8a8] rounded-lg px-3 py-1.5 flex items-center justify-center gap-2 shadow-md transition-colors duration-200 cursor-pointer">
                <img
                  src={Checkmark}
                  alt="Buy"
                  className="w-5 h-5"
                />
                <span className="text-[#2d5016] font-semibold text-2xl">50</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
