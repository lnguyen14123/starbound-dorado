import React, { useEffect } from "react";
import TaskbookL from "../assets/L_TaskBook.png";
import "../index.css";

export default function SlidingPanel({
  show,
  onClose,
  title,
  children,
  from = "left",
  dimBackground = true,
}) {
  const isTasksPage = title === "Tasks";

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && show) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [show, onClose]);

  const hiddenTransform = from === "right" ? "translate-x-full" : "-translate-x-full";
  const anchorClass = from === "right" ? "right-0" : "left-0";

  return (
    <div
      className={`fixed inset-0 z-40 transition-all duration-500 ease-in-out pointer-events-none`}
    >
      {/* Panel */}
      <div
        className={`absolute top-0 w-170 left-0 h-full transition-transform duration-500 ease-in-out pointer-events-auto ${
          show ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="relative h-full w-full flex items-center justify-center">
          <img
            src={TaskbookL}
            className="absolute inset-0 w-full h-[97vh] object-fill z-0 pointer-events-none"
            alt=""
          />

          <div className="relative h-full flex flex-col pl-22 py-6 text-[#4b3b2f] z-10">
            {!isTasksPage && (
              
              <div className="flex justify-center items-center rounded-md px-4 py-2">
                <h2 className="ml-[30] titleHeading font-dongle text-6xl font-bold">
                  {title}
                </h2>

                <button
                  className="mr-3 ml-10 mt-5 text-5xl font-dongle hover:text-[#886b52] transition cursor-pointer"
                  onClick={onClose}
                >
                  ✕
                </button>
              </div>
            )}

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
    </div>
  );
}
