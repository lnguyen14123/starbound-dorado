import React from "react";
import { useEquipped } from "../context/EquippedContext";

import FloorWooden from "../assets/floors/floor_wooden.svg";
import FloorGray from "../assets/floors/floor_gray.svg";
import TilesPink from "../assets/floors/tiles_pink.svg";
import TilesBlack from "../assets/floors/tiles_black.svg";

const FLOOR_ASSETS = {
  floor_wood: FloorWooden,
  floor_gray: FloorGray,
  tiles_pink: TilesPink,
  tiles_black: TilesBlack,
};

const Floor = ({ className = "" }) => {
  const { equipped } = useEquipped();
  const equippedFloorId = equipped.room.floor_item;
  const FloorImage = FLOOR_ASSETS[equippedFloorId] || FloorWooden;

  return (
    <div className={`bg-transparent w-screen ${className}`}>

      {/* Black separator line */}
      <div className="absolute bottom-[30vh] left-0 w-full h-[.8vh] bg-black z-10"></div>

      {/* Floor Image */}
      <img
        src={FloorImage}
        alt="Equipped Floor"
        className={`absolute bottom-0 left-0 w-full min-w-full object-cover h-[30vh] z-0 ${className}`}
      />
    </div>
  );
};

export default Floor;
