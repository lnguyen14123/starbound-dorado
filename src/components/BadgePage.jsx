import React from "react";
import Award1 from "../assets/badges/Award1.png";
import Award2 from "../assets/badges/Award2.png";
import Award3 from "../assets/badges/Award3.png";
import Calendar1 from "../assets/badges/Calendar1.png";
import Calendar2 from "../assets/badges/Calendar2.png";
import Calendar3 from "../assets/badges/Calendar3.png";
import Compass1 from "../assets/badges/Compass1.png";
import Compass2 from "../assets/badges/Compass2.png";
import Compass3 from "../assets/badges/Compass3.png";
import Pen1 from "../assets/badges/Pen1.png";
import Pen2 from "../assets/badges/Pen2.png";
import Pen3 from "../assets/badges/Pen3.png";

const badges = [
  Award1, Award2, Award3,
  Calendar1, Calendar2, Calendar3,
  Compass1, Compass2, Compass3,
  Pen1, Pen2, Pen3
];

// 🎯 Choose which are locked
const lockedBadges = [1, 4, 5, 7, 10, 11]; 
// means badge #2, #5, #8 are locked

function BadgePage({ onClose }) {
  return (
    <div className="w-133 h-[calc(100vh-170px)] mt-[1vh] p-1 overflow-y-auto will-change-transform">
      <div className="w-full bg-[#F1E2D4] rounded-2xl p-3">
        <div className="grid grid-cols-3 gap-4 w-full p-1">
          {badges.map((badge, index) => {
            const locked = lockedBadges.includes(index);

            return (
              <div
                key={index}
                className={`bg-[#E4CFBD] rounded-2xl w-full aspect-square shadow-md 
                  flex items-center justify-center transition duration-300 
                  ${locked ? "opacity-50 grayscale-[40%] cursor-not-allowed" : "hover:shadow-xl hover:scale-105 cursor-pointer"}`}
              >
                <img
                  src={badge}
                  alt=""
                  className={`w-3/4 h-3/4 object-contain ${locked ? "grayscale-[40%]" : ""}`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default React.memo(BadgePage);
