import React, { useState } from "react";
import "../index.css";

export default function TaskPage({ onClose }) {
  const [openId, setOpenId] = useState(null);

  return (
    <div className="flex h-full w-full ">

      <div className="flex flex-col">
        {/* Rounded rectangle */}
        <div className="-ml-[1vw] h-[75vh] w-[35vw] max-w-4xl p-8 bg-[#f4e1d2] rounded-2xl border-2 border-[#926B51]">
          {/* Flex container for Low / Medium / High */}
          <div className="flex gap-4">
            <div className="h-[4vh] w-[6vw] text-2xl bg-[#d2ee80] rounded-2xl flex items-center justify-center pt-1 text-[#48855c]">
              Low
            </div>
            <div className="h-[4vh] w-[6vw] text-2xl bg-[#fcd68d] rounded-2xl flex items-center justify-center pt-1 text-[#e5a01c]">
              Medium
            </div>
            <div className="h-[4vh] w-[6vw] text-2xl bg-[#ffbac4] rounded-2xl flex items-center justify-center pt-1 text-[#f5526b]">
              High
            </div>
          </div>
      </div>

        {/* Left-aligned button */}
        <button
          onClick={() => console.log("Button clicked")}
          className="mt-4 px-2 pt-1 w-[20vw] bg-[#AD7B5C] text-white font-bold rounded-2xl cursor-pointer transition
           shadow-[0_7px_4px_rgba(0,0,0,0.3)] "
        >
          + Add Task
        </button>
      </div>
    </div>
  );
}
