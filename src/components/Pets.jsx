import React, { useState, useEffect } from "react";

import GrayCatOpen from "../assets/pets/graycat/graycat_normal.svg";
import GrayCatBlink from "../assets/pets/graycat/graycat_blink.svg";
import GrayCatHappy from "../assets/pets/graycat/graycat_happy.svg";
import YellowDogOpen from "../assets/pets/yellowdog/yellowdog_normal.svg";
import YellowDogBlink from "../assets/pets/yellowdog/yellowdog_blink.svg";
import YellowDogHappy from "../assets/pets/yellowdog/yellowdog_happy.svg";

import { useEquipped } from "../context/EquippedContext";

// Collars
import RedCollar from "../assets/pets/clothing/collars/red_collar.svg";
import BlueCollar from "../assets/pets/clothing/collars/blue_collar.svg";
import BowTie from "../assets/pets/clothing/collars/bowtie.svg";

// Hats
import PartyHat from "../assets/pets/clothing/hats/party_hat.svg";
import Crown from "../assets/pets/clothing/hats/crown.svg";
import BlueCap from "../assets/pets/clothing/hats/blue_cap.svg";

const Pets = ({ petType }) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [isHappy, setIsHappy] = useState(false);
  const [isJumping, setIsJumping] = useState(false);

  const [happiness, setHappiness] = useState(50);
  const [hunger, setHunger] = useState(50);
  const [thirst, setThirst] = useState(50);

  const [equippedItems, setEquippedItems] = useState(null);

  const { equipped } = useEquipped();

  const resolvedItems = {
    collar: equipped.pet.collar_item,
    hat: equipped.pet.hat_item,
  };

  // 🐾 Blinking effect
useEffect(() => {
  if (!petType) return;

  const blink = () => {
    setIsBlinking(true);
    setTimeout(() => setIsBlinking(false), 150);
  };

  const interval = setInterval(() => {
    if (Math.random() > 0.3) {
      blink();
    }
  }, Math.random() * 4000 + 2000); // random 2-6s interval

  return () => clearInterval(interval);
}, [petType]);

  // ⏳ Decrease stats over time
  useEffect(() => {
    if (!petType) return;

    const statsInterval = setInterval(() => {
      setHappiness((prev) => Math.max(0, prev - 1));
      setHunger((prev) => Math.max(0, prev - 2));
      setThirst((prev) => Math.max(0, prev - 2));
    }, 60000);

    return () => clearInterval(statsInterval);
  }, [petType]);

  // 🧢 Clothing helpers
  const getCollarImage = () => {
    if (!resolvedItems?.collar) return null;
    const collars = {
      collar_red: RedCollar,
      collar_blue: BlueCollar,
      bowtie: BowTie,
    };
    return collars[resolvedItems.collar];
  };

  const getHatImage = () => {
    if (!resolvedItems?.hat) return null;
    const hats = {
      hat_party: PartyHat,
      crown: Crown,
      cap_blue: BlueCap,
    };
    return hats[resolvedItems.hat];
  };

  // 🐶 Click behavior
  const handleClick = () => {
    if (isHappy || isJumping) return;
    setHappiness((prev) => Math.min(100, prev + 5));
    setIsHappy(true);
    setIsJumping(true);
    setTimeout(() => setIsJumping(false), 500);
    setTimeout(() => setIsHappy(false), 2000);
  };

  // 🐱 Pet image selection (you might already have a helper)
  const getPetImage = () => {
    if (petType === "graycat")
      return isHappy
        ? GrayCatHappy
        : isBlinking
        ? GrayCatBlink
        : GrayCatOpen;
    if (petType === "yellowdog")
      return isHappy
        ? YellowDogHappy
        : isBlinking
        ? YellowDogBlink
        : YellowDogOpen;
    return null;
  };

  const getMotionClasses = () => {
    let classes = "transition-transform duration-500";
    if (isJumping) {
      classes += " -translate-y-12";
    } else if (isBlinking) {
      classes += " -translate-y-1";
    }
    return classes;
  };

  const getPetLayoutClasses = () => {
    let classes = "h-[48vh] translate-y-[10vh]";
    if (petType?.toLowerCase().includes("cat")) {
      classes += " translate-x-4";
    } else {
      classes += " -translate-x-30";
    }
    return classes;
  };

  const hatClasses = {
  hat_party: "h-[26vh] translate-y-[14vh] -translate-x-20",
  crown: "h-[16vh] translate-y-[12vh] -translate-x-21", 
  cap_blue: "h-[18vh] translate-y-[13vh] -translate-x-20",
};

const collarClasses = {
  collar_red: "h-[10vh] -translate-y-[12vh] -translate-x-18",
  collar_blue: "h-[10vh] -translate-y-[13vh] -translate-x-19",
  bowtie: "h-[9vh] -translate-y-[13vh] -translate-x-18",
};

  // Extra adjustments ONLY for cats
const hatCatAdjust = {
  crown: "!translate-y-[14vh]",    // move crown down slightly
  cap_blue: "!h-[15vh] !translate-y-[14vh]", // move blue cap down slightly
};


return (
  <div className="absolute w-full h-full flex items-center justify-center">
<div className={`${getMotionClasses()} flex flex-col items-center relative select-none z-40
                 ${!resolvedItems?.hat ? "translate-y-4" : ""}`}>
      
      {/* Hat */}
{getHatImage() && (
  <img
    src={getHatImage()}
    alt="Hat"
    className={`
      ${hatClasses[resolvedItems.hat] || ""}
      ${petType?.includes("cat") ? hatCatAdjust[resolvedItems.hat] || "" : ""}
      ${petType?.includes("dog") ? "-mb-8" : "-mb-8"} 
      z-31
    `}
  />
)}

      {/* Pet */}
      <img
        src={getPetImage()}
        alt={petType}
        onMouseEnter={() => setIsBlinking(true)}
        onMouseLeave={() => setIsBlinking(false)}
        onClick={handleClick}
        className={`${getPetLayoutClasses()} cursor-pointer
          h-[45vh] z-30`}
      />

      {/* Collar */}
{getCollarImage() && (
  <img
    src={getCollarImage()}
    alt="Collar"
    className={`
      ${collarClasses[resolvedItems.collar] || ""}
      cursor-pointer z-31
      ${petType?.includes("dog") ? "mt-[-3vh]" : "mt-[-5vh]"}
    `}
  />
)}

    </div>
  </div>
);

};

export default Pets;