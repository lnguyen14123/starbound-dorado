import React from "react";
import { useEquipped } from "../context/EquippedContext";

// Floor assets
import FloorWooden from "../assets/floors/floor_wooden.svg";
import FloorGray from "../assets/floors/floor_gray.svg";

// Map your floor IDs to assets
const FLOOR_ASSETS = {
  floor_wood: FloorWooden,
  floor_gray: FloorGray,
};

const Floor = ({ className = "" }) => {
  const { equipped } = useEquipped();

  // Get the currently equipped floor
  const equippedFloorId = equipped.room.floor_item;
  const FloorImage = FLOOR_ASSETS[equippedFloorId] || FloorWooden;

  return (
    <div className={`bg-transparent w-screen ${className}`}>
<img
  src={FloorImage}
  alt="Equiped Floor"
  className={`absolute bottom-0 left-0 w-full min-w-full object-cover h-[30vh] z-0 ${className}`}
/>
    </div>
  );
};

export default Floor;
