import React, { useState, useEffect, useRef, useCallback } from "react";
import Checkmark from "../assets/icons/checkmark.png";

import BlueCollar from "../assets/pets/clothing/collars/blue_collar.svg";
import Bowtie from "../assets/pets/clothing/collars/bowtie.svg";
import RedCollar from "../assets/pets/clothing/collars/red_collar.svg";
import LeatherCollar from "../assets/pets/clothing/collars/leather_collar.svg";
import SpikyCollar from "../assets/pets/clothing/collars/spiky_collar.svg";

import BlueCap from "../assets/pets/clothing/hats/blue_cap.svg";
import Crown from "../assets/pets/clothing/hats/crown.svg";
import PurpleCrown from "../assets/pets/clothing/hats/purple_crown.svg";
import PartyHat from "../assets/pets/clothing/hats/party_hat.svg";
import TopHat from "../assets/pets/clothing/hats/top_hat.svg";
import ConductorHat from "../assets/pets/clothing/hats/conductor_hat.svg";
import TennisHat from "../assets/pets/clothing/hats/tennis_hat.svg";
import RedBeanie from "../assets/pets/clothing/hats/red_beanie.svg";
import CowboyHat from "../assets/pets/clothing/hats/cowboy_hat.svg";
import BucketHat from "../assets/pets/clothing/hats/bucket_hat.svg";


import FloorWood from "../assets/floors/floor_wooden.svg";
import FloorGray from "../assets/floors/floor_gray.svg";
import TilesPink from "../assets/floors/tiles_pink.svg";
import TilesBlack from "../assets/floors/tiles_black.svg";

import WallBasic from "../assets/walls/basic_wall.svg";
import WallLight from "../assets/walls/light_wall.svg";
import WallDark from "../assets/walls/dark_wall.svg";
import WallBrick from "../assets/walls/brick_wall.svg";

import { useCurrency } from "../context/CurrencyContext";
import { useTheme } from "../context/ThemeContext";
import { useSoundSettings } from "../context/SoundContext";
import purchaseSfx from "../assets/sounds/store-purchase.mp3";

export default function StorePage({ onClose, panelVisible, selectedCategory }) {
  const storeItems = [
    {
      id: 1,
      name: "Blue Collar",
      price: 50,
      image: BlueCollar,
      category: "Collars",
      db_name: "collar_blue",
    },
    {
      id: 2,
      name: "Red Collar",
      price: 50,
      image: RedCollar,
      category: "Collars",
      db_name: "collar_red",
    },
        {
      id: 3,
      name: "Bow tie",
      price: 75,
      image: Bowtie,
      category: "Collars",
      db_name: "bowtie",
    },
        {
      id: 4,
      name: "Leather Collar",
      price: 75,
      image: LeatherCollar,
      category: "Collars",
      db_name: "collar_leather",
    },
        {
      id: 5,
      name: "Spiky Collar",
      price: 75,
      image: SpikyCollar,
      category: "Collars",
      db_name: "collar_spiky",
    },

    {
      id: 20,
      name: "Blue Cap",
      price: 50,
      image: BlueCap,
      category: "Hats",
      db_name: "cap_blue",
    },
        {
      id: 21,
      name: "Party Hat",
      price: 50,
      image: PartyHat,
      category: "Hats",
      db_name: "hat_party",
    },

    {
      id: 22,
      name: "Crown",
      price: 75,
      image: Crown,
      category: "Hats",
      db_name: "crown",
    },
    {
      id: 23,
      name: "Purple Crown",
      price: 100,
      image: PurpleCrown,
      category: "Hats",
      db_name: "crown_purple",
    },

    {
      id: 24,
      name: "Top Hat",
      price: 100,
      image: TopHat,
      category: "Hats",
      db_name: "hat_top",
    },
    {
      id: 25,
      name: "Conductor Hat",
      price: 100,
      image: ConductorHat,
      category: "Hats",
      db_name: "hat_conductor",
    },
    {
      id: 26,
      name: "Tennis Hat",
      price: 100,
      image: TennisHat,
      category: "Hats",
      db_name: "hat_tennis",
    },
    {
      id: 27,
      name: "Red Beanie",
      price: 100,
      image: RedBeanie,
      category: "Hats",
      db_name: "beanie_red",
    },
    {
      id: 28,
      name: "Cowboy Hat",
      price: 100,
      image: CowboyHat,
      category: "Hats",
      db_name: "hat_cowboy",
    },
    {
      id: 29,
      name: "Bucket Hat",
      price: 100,
      image: BucketHat,
      category: "Hats",
      db_name: "hat_bucket",
    },

      // ---------------- Floors ----------------
  {
    id: 30,
    name: "Wooden Floor",
    price: 150,
    image: FloorWood,
    category: "Floors",
    db_name: "floor_wood",
  },
  {
    id: 31,
    name: "Gray Floor",
    price: 150,
    image: FloorGray,
    category: "Floors",
    db_name: "floor_gray",
  },
  {
    id: 32,
    name: "Pink Tiles",
    price: 150,
    image: TilesPink,
    category: "Floors",
    db_name: "tiles_pink",
    },
  {
    id: 33,
    name: "Black Tiles",
    price: 150,
    image: TilesBlack,
    category: "Floors",
    db_name: "tiles_black",
    },
  // ---------------- Walls ----------------
{
  id: 50,
  name: "Basic Wall",
  price: 150,
  image: WallBasic,
  category: "Walls",
  db_name: "wall_basic",
},
{
  id: 51,
  name: "Light Wall",
  price: 150,
  image: WallLight,
  category: "Walls",
  db_name: "wall_light",
},
{
  id: 52,
  name: "Dark Wall",
  price: 150,
  image: WallDark,
  category: "Walls",
  db_name: "wall_dark",
},
{
  id: 53,
  name: "Brick Wall",
  price: 150,
  image: WallBrick,
  category: "Walls",
  db_name: "wall_brick",
},

  ];

  const { currency, setCurrency } = useCurrency();
  const { theme = "light" } = useTheme() || {};
  const { masterVolume, sfxVolume } = useSoundSettings();

  const [showPopup, setShowPopup] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [popupContent, setPopupContent] = useState({
    title: "",
    message: "",
    isError: false,
  });
  const [ownedItems, setOwnedItems] = useState(() => new Set());
  const purchaseSoundRef = useRef(null);

  const timeoutRef = useRef(null);
  const FADE_MS = 300;

  useEffect(() => {
    if (showPopup) closePopup();
  }, [selectedCategory]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

const [loadingItems, setLoadingItems] = useState(true);

const refreshOwnedItems = useCallback(async () => {
  const uid = localStorage.getItem("uid");
  if (!uid) return;

  try {
    const res = await fetch(`/api/inventory/${uid}`);
    if (!res.ok) throw new Error("Failed to load inventory");
    const data = await res.json();
    setOwnedItems(new Set((data.items || []).map((item) => item.item_id)));
  } catch (err) {
    console.error("Failed to refresh owned items", err);
  } finally {
    setLoadingItems(false);
  }
}, []);

useEffect(() => {
  refreshOwnedItems();
}, [refreshOwnedItems]);

  useEffect(() => {
    const handleRefresh = () => refreshOwnedItems();
    window.addEventListener("inventoryRefresh", handleRefresh);
    return () =>
      window.removeEventListener("inventoryRefresh", handleRefresh);
  }, [refreshOwnedItems]);

  useEffect(() => {
    purchaseSoundRef.current = new Audio(purchaseSfx);
    return () => purchaseSoundRef.current?.pause();
  }, []);

  useEffect(() => {
    if (purchaseSoundRef.current) {
      purchaseSoundRef.current.volume =
        0.5 * (masterVolume ?? 1) * (sfxVolume ?? 1);
    }
  }, [masterVolume, sfxVolume]);

  const playPurchaseSound = () => {
    if (!purchaseSoundRef.current) return;
    purchaseSoundRef.current.currentTime = 0;
    purchaseSoundRef.current.play();
  };

  function openPopup(content) {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setPopupContent(content);
    setIsFading(false);
    setShowPopup(true);
  }

  function closePopup() {
    setIsFading(true);
    timeoutRef.current = setTimeout(() => {
      setShowPopup(false);
      setIsFading(false);
      timeoutRef.current = null;
    }, FADE_MS);
  }

  async function confirmPurchase(item) {
    const uid = localStorage.getItem("uid");
    if (!uid) return;

    try {
      const res = await fetch("/api/user/reward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, amount: -item.price }), // subtract coins
      });

      if (!res.ok) throw new Error("Purchase failed");

      const invRes = await fetch("/api/inventory/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid,
          item: item.db_name, // <-- THIS saves the exact item
          category: item.category, // optional but useful
        }),
      });

      if (!invRes.ok) throw new Error("Failed to add item to inventory");

      const data = await res.json();
      // Update local state
      window.dispatchEvent(new Event("inventoryRefresh"));
      setOwnedItems((prev) => {
        const updated = new Set(prev);
        updated.add(item.db_name);
        return updated;
      });
      setCurrency((prev) => prev - item.price);
      playPurchaseSound();
      closePopup();
      console.log("Purchase successful", data);
    } catch (err) {
      console.error(err);
    }
  }

  function handleBuy(item) {
    if (currency < item.price) {
      // Not enough funds popup
      openPopup({
        title: "Not enough coins",
        message: "You don't have enough coins to buy this item.",
        isError: true,
        showYesNo: false,
        onConfirm: null,
      });
      return;
    }

    // Ask for confirmation
    openPopup({
      title: "Confirm Purchase",
      message: `Are you sure you want to buy ${item.name} for ${item.price} coins?`,
      isError: false,
      showYesNo: true,
      onConfirm: () => confirmPurchase(item),
    });
  }

  const filteredItems = storeItems
    .filter((item) => item.category === selectedCategory)
    .filter((item) => !ownedItems.has(item.db_name));

  const panelClass =
    theme === "dark"
      ? "bg-[#1f2434]/95 border border-[#353a52] text-[#f5ede1]"
      : "bg-[#F1E2D4]";

  const cardClass =
    theme === "dark"
      ? "bg-[#2b3347]/90 text-[#f5ede1]"
      : "bg-[#E4CFBD]";

  const buyButtonClass =
    theme === "dark"
      ? "bg-[#4c6d3d] hover:bg-[#678b59] text-[#ecffdf]"
      : "bg-[#b6e5b6] hover:bg-[#a8d8a8] text-[#2d5016]";

  const popupClass =
    theme === "dark"
      ? "bg-[#1f2434] text-[#f5ede1]"
      : "bg-white text-[#4b3b2f]";

  const popupButtonPrimary =
    theme === "dark"
      ? "bg-[#4c6d3d] hover:bg-[#678b59] text-[#ecffdf]"
      : "bg-[#b6e5b6] hover:bg-[#a8d8a8] text-[#2d5016]";

  const popupButtonSecondary =
    theme === "dark"
      ? "bg-[#3a2d2d] hover:bg-[#4f3c3c] text-[#f5ede1]"
      : "bg-[#e4cfbd] hover:bg-[#d3bfae] text-[#4b3b2f]";

  return (
    <div className="w-125 h-[78vh] mt-[1vh] items-center justify-center relative flex">
      <div className={`w-full h-full rounded-2xl p-3 overflow-hidden flex flex-col relative ${panelClass}`}>
        <div className="grid grid-cols-2 gap-3 w-full p-1 overflow-y-auto overflow-x-hidden min-h-0 content-start items-start">
          {!loadingItems && filteredItems.map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl w-full aspect-[4/3] shadow-md hover:shadow-lg transition-shadow duration-300 relative flex flex-col justify-end items-center ${cardClass}`}
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-2/3 h-auto mt-2 mb-17"
              />
              <button
                onClick={() => handleBuy(item)}
                className={`absolute bottom-2 left-5 right-5 rounded-lg px-3 py-1.5 flex items-center justify-center gap-2 shadow-md transition-colors duration-200 cursor-pointer ${buyButtonClass}`}
              >
                <img src={Checkmark} alt="Buy" className="w-5 h-5" />
                <span className="font-semibold text-2xl">
                  {item.price}
                </span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Popup */}
      {showPopup && (
        <div
          className={`absolute inset-0 flex items-center justify-center z-50 transition-opacity duration-300 ${
            isFading ? "opacity-0" : "opacity-100"
          }`}
          onClick={closePopup}
        >
          <div
            className={`${popupClass} rounded-2xl p-5 shadow-xl min-w-[250px] text-center transform transition-all duration-300 ${
              isFading ? "opacity-0 scale-95" : "opacity-100 scale-100"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <h1
              className={`text-xl font-bold mb-2 ${
                popupContent.isError ? "text-red-600" : "text-green-600"
              }`}
            >
              {popupContent.title}
            </h1>
            <p className="mb-4">{popupContent.message}</p>

            {popupContent.showYesNo ? (
              <div className="flex justify-around mt-3">
                <button
                  className={`${popupButtonPrimary} px-4 py-2 rounded-lg font-semibold cursor-pointer`}
                  onClick={popupContent.onConfirm}
                >
                  Yes
                </button>
                <button
                  className={`${popupButtonSecondary} px-4 py-2 rounded-lg font-semibold cursor-pointer`}
                  onClick={closePopup}
                >
                  No
                </button>
              </div>
            ) : (
              <button
                className={`${popupButtonPrimary} px-4 py-2 rounded-lg font-semibold cursor-pointer`}
                onClick={closePopup}
              >
                OK
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
