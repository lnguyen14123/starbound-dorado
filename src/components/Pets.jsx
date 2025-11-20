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
import LeatherCollar from "../assets/pets/clothing/collars/leather_collar.svg";
import SpikyCollar from "../assets/pets/clothing/collars/spiky_collar.svg";

// Hats
import PartyHat from "../assets/pets/clothing/hats/party_hat.svg";
import Crown from "../assets/pets/clothing/hats/crown.svg";
import PurpleCrown from "../assets/pets/clothing/hats/purple_crown.svg";
import BlueCap from "../assets/pets/clothing/hats/blue_cap.svg";
import TopHat from "../assets/pets/clothing/hats/top_hat.svg";
import ConductorHat from "../assets/pets/clothing/hats/conductor_hat.svg";
import TennisHat from "../assets/pets/clothing/hats/tennis_hat.svg";
import RedBeanie from "../assets/pets/clothing/hats/red_beanie.svg";
import CowboyHat from "../assets/pets/clothing/hats/cowboy_hat.svg";
import BucketHat from "../assets/pets/clothing/hats/bucket_hat.svg";

const DEFAULT_REM_IN_PX = 16;
const BASE_PET_SHIFT_REM = 1; // cat artwork offset
const PET_HORIZONTAL_SHIFT_REM = {
  cat: BASE_PET_SHIFT_REM,
  dog: -7.5,
};

const DEFAULT_HAT_BASE = { height: "18vh", xRem: -4.45 };
const DEFAULT_HAT_VARIANTS = {
  cat: { yVh: 18, xVh: -12 },
  dog: { yVh: 17, xVh: 6 },
};

const HAT_POSITION_PRESETS = {
  hat_party: {
    base: { ...DEFAULT_HAT_BASE, height: "22vh" },
    ...DEFAULT_HAT_VARIANTS,
    dog: { ...DEFAULT_HAT_VARIANTS.dog, yVh: 17},
  },
  crown: {
    base: { ...DEFAULT_HAT_BASE, height: "14vh" },
    ...DEFAULT_HAT_VARIANTS,
  },
  crown_purple: {
    base: { ...DEFAULT_HAT_BASE, height: "14vh" },
    ...DEFAULT_HAT_VARIANTS,
  },
  cap_blue: {
    base: { ...DEFAULT_HAT_BASE, height: "20vh" },
    cat: { ...DEFAULT_HAT_VARIANTS.cat, yVh: 22},
    dog: { ...DEFAULT_HAT_VARIANTS.dog, yVh: 22},
  },
  hat_top: {
    base: { ...DEFAULT_HAT_BASE, height: "24vh" },
    cat: { ...DEFAULT_HAT_VARIANTS.cat, yVh: 21, xVh: -12.5 },
    dog: { ...DEFAULT_HAT_VARIANTS.dog, yVh: 21},
  },
  hat_conductor: {
    base: DEFAULT_HAT_BASE,
    cat: { ...DEFAULT_HAT_VARIANTS.cat, yVh: 22},
    dog: { ...DEFAULT_HAT_VARIANTS.dog, yVh: 22},
  },
  hat_tennis: {
    base: { ...DEFAULT_HAT_BASE, height: "20vh" },
    cat: { ...DEFAULT_HAT_VARIANTS.cat, yVh: 23},
    dog: { ...DEFAULT_HAT_VARIANTS.dog, yVh: 23},
  },
  beanie_red: {
    base: { ...DEFAULT_HAT_BASE, height: "20vh" },
    cat: { ...DEFAULT_HAT_VARIANTS.cat, yVh: 19},
    dog: { ...DEFAULT_HAT_VARIANTS.dog, yVh: 19},
  },
  hat_cowboy: {
    base: { ...DEFAULT_HAT_BASE, height: "22vh" },
    cat: { ...DEFAULT_HAT_VARIANTS.cat, yVh: 20},
    dog: { ...DEFAULT_HAT_VARIANTS.dog, yVh: 20},
  },
  hat_bucket: {
    base: { ...DEFAULT_HAT_BASE, height: "22vh" },
    cat: { ...DEFAULT_HAT_VARIANTS.cat, yVh: 20},
    dog: { ...DEFAULT_HAT_VARIANTS.dog, yVh: 21},
  },
};

const DEFAULT_COLLAR_BASE = { height: "8vh", xRem: -4.45 };
const DEFAULT_COLLAR_VARIANTS = {
  cat: { yVh: -14.5, xVh: -11 },
  dog: { yVh: -14, xVh: 7 },
};

const COLLAR_POSITION_PRESETS = {
  collar_red: {
    base: DEFAULT_COLLAR_BASE,
    ...DEFAULT_COLLAR_VARIANTS,
  },
  collar_blue: {
    base: DEFAULT_COLLAR_BASE,
    ... DEFAULT_COLLAR_VARIANTS,
  },
  bowtie: {
    base: DEFAULT_COLLAR_BASE,
    ... DEFAULT_COLLAR_VARIANTS,
  },
  collar_leather: {
    base: {DEFAULT_COLLAR_BASE, height: "10vh"},
    cat: { ...DEFAULT_COLLAR_VARIANTS.cat, yVh: -17, xVh: -11},
    dog: { ...DEFAULT_COLLAR_VARIANTS.dog, yVh: -16, xVh: 7},
  },
  collar_spiky: {
    base: {DEFAULT_COLLAR_BASE, height: "11vh"},
    cat: { ...DEFAULT_COLLAR_VARIANTS.cat, yVh: -14.5, xVh: -11},
    dog: { ...DEFAULT_COLLAR_VARIANTS.dog, yVh: -14, xVh: 7},
  },
};

const getPetVariant = (petType) => {
  if (!petType) return "dog";
  const normalized = petType.toLowerCase();
  if (normalized.includes("cat")) return "cat";
  if (normalized.includes("dog")) return "dog";
  return "dog";
};

const convertRemOffsetToVh = (remValue, viewport) => {
  if (typeof remValue !== "number") return null;
  const { height, rem } = viewport || {};
  if (!height || !rem) return null;
  const px = remValue * rem;
  return (px / height) * 100;
};

const resolveClothingStyle = (
  itemKey,
  presets,
  petVariant,
  viewport,
  horizontalDeltaRem = 0
) => {
  if (!itemKey || !presets[itemKey]) return null;

  const preset = presets[itemKey];
  const resolved = { ...(preset.base || {}), ...(preset[petVariant] || {}) };
  const netXRem = (resolved.xRem ?? 0) + horizontalDeltaRem;
  const convertedYRem =
    typeof resolved.yRem === "number"
      ? convertRemOffsetToVh(resolved.yRem, viewport)
      : null;

  const deltaXVh =
    horizontalDeltaRem !== 0
      ? convertRemOffsetToVh(horizontalDeltaRem, viewport)
      : 0;

  const computedXVh =
    resolved.xVh !== undefined
      ? deltaXVh !== null
        ? (resolved.xVh ?? 0) + deltaXVh
        : resolved.xVh
      : convertRemOffsetToVh(netXRem, viewport) ?? null;
  const computedYVh =
    resolved.yVh !== undefined || convertedYRem !== null
      ? (resolved.yVh ?? 0) + (convertedYRem ?? 0)
      : null;

  const style = {
    transform: `translate(${
      computedXVh !== null ? `${computedXVh}vh` : `${netXRem}rem`
    }, ${computedYVh !== null ? `${computedYVh}vh` : "0"})`,
  };

  if (resolved.height) {
    style.height = resolved.height;
  }

  return style;
};

const Pets = ({ petType }) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [isHappy, setIsHappy] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [viewport, setViewport] = useState({
    height: 0,
    rem: DEFAULT_REM_IN_PX,
  });

  const [happiness, setHappiness] = useState(50);
  const [hunger, setHunger] = useState(50);
  const [thirst, setThirst] = useState(50);

  const [equippedItems, setEquippedItems] = useState(null);

  const { equipped } = useEquipped();

  const resolvedItems = {
    collar: equipped.pet.collar_item,
    hat: equipped.pet.hat_item,
  };

  const petVariant = getPetVariant(petType);
  const horizontalShiftDelta =
    (PET_HORIZONTAL_SHIFT_REM[petVariant] ?? BASE_PET_SHIFT_REM) -
    BASE_PET_SHIFT_REM;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      const height = window.innerHeight || 0;
      const rem =
        parseFloat(
          getComputedStyle(document.documentElement).fontSize || "16"
        ) || DEFAULT_REM_IN_PX;
      setViewport({ height, rem });
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
      collar_leather: LeatherCollar,
      collar_spiky: SpikyCollar,

    };
    return collars[resolvedItems.collar];
  };

  const getHatImage = () => {
    if (!resolvedItems?.hat) return null;
    const hats = {
      hat_party: PartyHat,
      crown: Crown,
      crown_purple: PurpleCrown,
      cap_blue: BlueCap,
      hat_top: TopHat,
      hat_conductor: ConductorHat,
      hat_tennis: TennisHat,
      beanie_red: RedBeanie,
      hat_cowboy: CowboyHat,
      hat_bucket: BucketHat,
    };
    return hats[resolvedItems.hat];
  };

  // 🐶 Click behavior
  const handleClick = () => {
    if (isHappy || isJumping) return;
    setHappiness((prev) => Math.min(100, prev + 5));
    setIsHappy(true);
    setIsJumping(true);
    setTimeout(() => setIsJumping(false), 600);
    setTimeout(() => setIsHappy(false), 1000);
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
    let classes = "transition-transform duration-700";
    if (isJumping) {
      classes += " -translate-y-8";
    } else if (isBlinking) {
      classes += " -translate-y-1";
    }
    return classes;
  };

  const getPetLayoutClasses = () => {
    let classes = "h-[48vh] translate-y-[10vh]";
    if (petVariant === "cat") {
      classes += " translate-x-4";
    } else {
      classes += " -translate-x-30";
    }
    return classes;
  };

  const hatStyle = resolveClothingStyle(
    resolvedItems.hat,
    HAT_POSITION_PRESETS,
    petVariant,
    viewport,
    horizontalShiftDelta
  );

  const collarStyle = resolveClothingStyle(
    resolvedItems.collar,
    COLLAR_POSITION_PRESETS,
    petVariant,
    viewport,
    horizontalShiftDelta
  );

  const hatSlotStyle = DEFAULT_HAT_BASE.height
    ? { height: DEFAULT_HAT_BASE.height }
    : undefined;
  const collarSlotStyle = DEFAULT_COLLAR_BASE.height
    ? { height: DEFAULT_COLLAR_BASE.height }
    : undefined;

  return (
    <div className="absolute w-full h-full flex items-center justify-center">
      <div
        className={`${getMotionClasses()} flex flex-col items-center relative select-none z-40`}
      >

      {/* Hat */}
      <div
        className="flex items-end justify-center w-full"
        style={hatSlotStyle}
      >
        {getHatImage() && (
          <img
            src={getHatImage()}
            alt="Hat"
            style={hatStyle || undefined}
            className="z-31"
          />
        )}
      </div>

      {/* Pet */}
      <img
        src={getPetImage()}
        alt={petType}
          onClick={handleClick}
          onMouseEnter={() => {
  setIsBlinking(true);
  setTimeout(() => setIsBlinking(false), 150);
}}

        className={`${getPetLayoutClasses()} cursor-pointer
          h-[45vh] z-30`}
      />

      {/* Collar */}
      <div
        className="flex items-start justify-center w-full"
        style={collarSlotStyle}
      >
        {getCollarImage() && (
          <img
            src={getCollarImage()}
            alt="Collar"
            style={collarStyle || undefined}
            className="cursor-pointer z-31"
          />
        )}
      </div>
      </div>
    </div>
  );
};

export default Pets;

