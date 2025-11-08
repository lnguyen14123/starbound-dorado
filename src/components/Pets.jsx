import React, { useState, useEffect } from "react";

import GrayCatOpen from "../assets/pets/graycat/graycat_normal.svg";
import GrayCatBlink from "../assets/pets/graycat/graycat_blink.svg";
import GrayCatHappy from "../assets/pets/graycat/graycat_happy.svg";
import YellowDogOpen from "../assets/pets/yellowdog/yellowdog_normal.svg";
import YellowDogBlink from "../assets/pets/yellowdog/yellowdog_blink.svg";
import YellowDogHappy from "../assets/pets/yellowdog/yellowdog_happy.svg";

const Pets = ({ petType }) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [isHappy, setIsHappy] = useState(false);
  const [isJumping, setIsJumping] = useState(false);

  // Random blinking
  useEffect(() => {
    if (!petType) return;
    const blink = () => {
      if (!isHappy) {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 150);
      }
    };

    const interval = setInterval(() => {
      if (Math.random() > 0.3) {
        const delay = Math.random() * 4000 + 2000;
        setTimeout(blink, delay);
      }
    }, 7000);

    return () => clearInterval(interval);
  }, [petType, isHappy]);

  const handleClick = () => {
    if (isHappy || isJumping) return;

    setIsHappy(true);
    setIsJumping(true);

    setTimeout(() => setIsJumping(false), 500);
    setTimeout(() => setIsHappy(false), 2000);
  };

  const handleHoverBlink = () => {
    if (!isHappy) {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }
  };

  const getPetImage = () => {
    if (isHappy) {
      if (petType === "cat") return GrayCatHappy;
      if (petType === "dog") return YellowDogHappy;
    }

    if (petType === "cat") return isBlinking ? GrayCatBlink : GrayCatOpen;
    if (petType === "dog") return isBlinking ? YellowDogBlink : YellowDogOpen;

    return null;
  };

  const getPetStyles = () => {
    const base = "absolute z-20 h-auto -translate-x-[5vw] cursor-pointer transition-all duration-300";
    const anim = isJumping ? "animate-bounce" : "animate-bounce-slow";
    return `${base} ${anim} top-[45vh] w-[40vw] ${isJumping ? "scale-110" : ""}`;
  };

  return (
    <img
      src={getPetImage()}
      alt={petType}
      className={getPetStyles()}
      onClick={handleClick}
      onMouseEnter={handleHoverBlink} // blink once on hover
    />
  );
};

export default Pets;
