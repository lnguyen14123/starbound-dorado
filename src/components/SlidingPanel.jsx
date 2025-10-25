import React from "react";
import TaskbookL from "../assets/L_TaskBook.png";
import "../index.css";

export default function SlidingPanel({ show, onClose, title, children }) {
  const isTasksPage = title === "Tasks";

  return (
    <>
{/* Background overlay — appears when panel is open */}
{show && (
  <div
    onClick={onClose}
    className="fixed inset-0 z-30"
    style={{ backgroundColor: "rgba(0,0,0,0.2)" }}
  />
)}

      {/* Sliding panel */}
      <div
        className={`fixed top-0 left-0 h-full z-40
                    transform transition-transform duration-500 ease-in-out
                    ${show ? "translate-x-10" : "-translate-x-full"}`}
        style={{ width: "45vw" }}
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
      >
        {/* Image background */}
        <div className="relative h-full w-full items-center justify-center">
          <img
            src={TaskbookL}
            className="absolute inset-0 w-full top-1/2 -translate-y-1/2 h-[97vh] object-fill"
          />

          {/* Overlay for content */}
          <div className="relative h-full flex flex-col pl-[7vw] py-6 text-[#4b3b2f]">
            {/* Header (only show if not Tasks page) */}
            {!isTasksPage && (
              <div className="flex justify-between items-center rounded-md px-4 py-2">
                <h2 className="ml-8 titleHeading font-dongle text-6xl font-bold">
                  {title}
                </h2>
                <button
                  className="mr-3 text-5xl font-dongle hover:text-[#886b52] transition cursor-pointer"
                  onClick={onClose}
                >
                  ✕
                </button>
              </div>
            )}

            {/* Content */}
            <div
              className={`p-8 font-dongle text-5xl text-[#4b3b2f] ${
                !isTasksPage ? "-mt-8" : ""
              }`}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
