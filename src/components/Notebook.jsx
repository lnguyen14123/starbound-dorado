import React from "react";
import Taskbook from '../assets/taskbook.png';
import TaskbookL from '../assets/L_TaskBook.png';

function Notebook({ children }) {
  return (
    <div className="relative bg-transparent min-h-[100vh] min-w-[100vw] flex items-center justify-center">
      {/* Notebook image */}
      <img
        src={TaskbookL}
        alt="Notebook"
        className="absolute top-1/2 left-1/2 transform 
        -translate-x-1/2 -translate-y-1/2 w-1/2 h-auto z-20 scale-80 bg-transparent drop-shadow-[-10px_10px_10px_rgba(0,0,0,0.5)]"
      />

      {/* Children container matching the image size */}
      <div className="absolute z-30 pl-17 w-135 h-155 flex justify-center">
        {children}
      </div>
    </div>
  );
}

export default Notebook;
