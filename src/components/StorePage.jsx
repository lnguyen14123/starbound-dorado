import React, { useState, useEffect, useRef } from "react";
import Checkmark from "../assets/checkmark.png";

import BlueCollar from "../assets/pets/clothing/collars/blue_collar.svg";
import Bowtie from "../assets/pets/clothing/collars/bowtie.svg";
import RedCollar from "../assets/pets/clothing/collars/red_collar.svg";

import BlueCap from "../assets/pets/clothing/hats/blue_cap.svg";
import Crown from "../assets/pets/clothing/hats/crown.svg";
import PartyHat from "../assets/pets/clothing/hats/party_hat.svg";

import { useCurrency } from "../context/CurrencyContext";

export default function StorePage({ onClose, panelVisible, selectedCategory }) {
  const storeItems = [
    { id: 1, name: "Blue Collar", price: 50, image: BlueCollar, category: "Collars" },
    { id: 2, name: "Bow tie", price: 50, image: Bowtie, category: "Collars" },
    { id: 3, name: "Red Collar", price: 50, image: RedCollar, category: "Collars" },
    { id: 4, name: "Blue Cap", price: 50, image: BlueCap, category: "Hats" },
    { id: 5, name: "Crown", price: 50, image: Crown, category: "Hats" },
    { id: 6, name: "Party Hat", price: 50, image: PartyHat, category: "Hats" },
  ];

  const { currency, setCurrency } = useCurrency();

  const [showPopup, setShowPopup] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [popupContent, setPopupContent] = useState({ title: "", message: "", isError: false });

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

    const data = await res.json();
    // Update local state
    setCurrency(prev => prev - item.price);
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


  const filteredItems = storeItems.filter(item => item.category === selectedCategory);

  return (
    <div className="w-125 h-[78vh] mt-[1vh] items-center justify-center relative flex">
      <div className="w-full h-full bg-[#F1E2D4] rounded-2xl p-3 overflow-hidden flex flex-col relative">
        <div className="grid grid-cols-2 gap-3 w-full p-1 overflow-y-auto overflow-x-hidden min-h-0 content-start items-start">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-[#E4CFBD] rounded-2xl w-full aspect-[4/3] shadow-md hover:shadow-lg transition-shadow duration-300 relative flex flex-col justify-end items-center"
            >
              <img src={item.image} alt={item.name} className="w-2/3 h-auto mt-2 mb-17" />
              <button
                onClick={() => handleBuy(item)}
                className="absolute bottom-2 left-5 right-5 bg-[#b6e5b6] hover:bg-[#a8d8a8] rounded-lg px-3 py-1.5 flex items-center justify-center gap-2 shadow-md transition-colors duration-200 cursor-pointer"
              >
                <img src={Checkmark} alt="Buy" className="w-5 h-5" />
                <span className="text-[#2d5016] font-semibold text-2xl">{item.price}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Popup */}
      {showPopup && (
        <div
          className={`absolute inset-0 flex items-center justify-center z-50 transition-opacity duration-300 ${isFading ? "opacity-0" : "opacity-100"}`}
          onClick={closePopup}
        >

          <div
  className={`bg-white rounded-2xl p-5 shadow-xl min-w-[250px] text-center transform transition-all duration-300 ${
    isFading ? "opacity-0 scale-95" : "opacity-100 scale-100"
  }`}
  onClick={(e) => e.stopPropagation()}
>
  <h1 className={`text-xl font-bold mb-2 ${popupContent.isError ? "text-red-600" : "text-green-600"}`}>
    {popupContent.title}
  </h1>
  <p className="text-gray-700 mb-4">{popupContent.message}</p>

  {popupContent.showYesNo ? (
    <div className="flex justify-around mt-3">
      <button
        className="bg-[#b6e5b6] hover:bg-[#a8d8a8] px-4 py-2 rounded-lg font-semibold cursor-pointer"
        onClick={popupContent.onConfirm}
      >
        Yes
      </button>
      <button
        className="bg-[#e4cfbd] hover:bg-[#d3bfae] px-4 py-2 rounded-lg font-semibold cursor-pointer"
        onClick={closePopup}
      >
        No
      </button>
    </div>
  ) : (
    <button
      className="bg-[#b6e5b6] hover:bg-[#a8d8a8] px-4 py-2 rounded-lg font-semibold cursor-pointer"
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
