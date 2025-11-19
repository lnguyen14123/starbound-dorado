import React, { useEffect, useState } from "react";

export default function LoadingScreen({ onFinish }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start fade-out after ~1 second
    const timer = setTimeout(() => {
      setFadeOut(true);
    }, 800);

    // After fade-out animation completes (~500ms), notify parent
    const finishTimer = setTimeout(() => {
      onFinish();
    }, 1300);

    return () => {
      clearTimeout(timer);
      clearTimeout(finishTimer);
    };
  }, []);

  return (
    <div
      className={`
        fixed inset-0 flex items-center justify-center 
        bg-[#403e3e] z-[9999]
        transition-opacity duration-[500ms] 
        ${fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"}
      `}
    >
      <div className="absolute z-30 flex flex-col items-center gap-4 text-white">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        <div className="text-3xl font-semibold">Loading...</div>
      </div>
    </div>
  );
}
