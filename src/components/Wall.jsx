import React from "react";
import { useEquipped } from "../context/EquippedContext";

// Import wall assets
import WallBasic from "../assets/walls/basic_wall.svg";
import WallLight from "../assets/walls/light_wall.svg";
import WallDark from "../assets/walls/dark_wall.svg";
import WallBrick from "../assets/walls/brick_wall.svg";
// import WallBlue from "../assets/walls/wall_blue.svg";
// import WallPattern from "../assets/walls/wall_pattern.svg";

const WALL_ASSETS = {
  wall_basic: WallBasic,
  wall_light: WallLight,
  wall_dark: WallDark,
  wall_brick: WallBrick,
//   wall_blue: WallBlue,
//   wall_pattern: WallPattern,
};

export default function Wall({ className = "" }) {
  const { equipped } = useEquipped();

  const equippedWallId = equipped.room.wall_item;
  const WallImage = WALL_ASSETS[equippedWallId] || WallBasic;

    return (
    //   <div></div>
    <img
      src={WallImage}
      alt="Equipped Wall"
      className={`absolute top-0 left-0 w-screen h-[100vh] object-cover z-0 ${className}`}
    />
  );
}
