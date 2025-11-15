import React, { useState } from "react";
import Checkmark from "../assets/checkmark.png";

export default function StorePage({ onClose, panelVisible, selectedCategory }) {
  const [category, setCategory] = useState("Hats");

  const storeItems = [
    { id: 1, name: "Blue Collar", price: 50, image: "../assets/pets/clothing/collars/blue_collar.svg", category: "Collars" },
    { id: 2, name: "Bow tie", price: 50, image: "../assets/pets/clothing/collars/bowtie.svg", category: "Collars" },
    { id: 3, name: "Red Collar", price: 50, image: "../assets/pets/clothing/collars/red_collar.svg", category: "Collars" },

    { id: 4, name: "Blue Cap", price: 50, image: "../assets/pets/clothing/hats/blue_cap.svg", category: "Hats" },
    { id: 5, name: "Crown", price: 50, image: "../assets/pets/clothing/hats/crown.svg", category: "Hats" },
    { id: 6, name: "Party Hat", price: 50, image: "../assets/pets/clothing/hats/party_hat.svg", category: "Hats" },

    { id: 7, name: "Fancy Chair", price: 100, image: "../assets/furniture/chair.svg", category: "Furniture" },
    { id: 8, name: "Wooden Table", price: 150, image: "../assets/furniture/table.svg", category: "Furniture" },
  ];

  const filteredItems = storeItems.filter(item => item.category === selectedCategory);

  return (
    <div className="w-125 h-[78vh] mt-[1vh] items-center justify-center relative flex">
      <div className="w-full h-full bg-[#F1E2D4] rounded-2xl p-3 overflow-hidden flex flex-col relative">

        {/* Category buttons stick out only when panel is visible */}
        {panelVisible && (
          <div className="absolute top-1/4 right-[-2.5rem] flex flex-col gap-3">
            {["Hats", "Collars", "Furniture"].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`rotate-90 transform origin-bottom-left bg-[#E4CFBD] px-4 py-2 rounded-lg shadow-md hover:bg-[#d8bfa8] transition-colors duration-200 font-bold ${
                  category === cat ? "bg-[#b1d47f]" : ""
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 w-full p-1 overflow-y-auto overflow-x-hidden min-h-0 flex-1">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-[#E4CFBD] rounded-2xl w-full aspect-[4/3] shadow-md hover:shadow-lg transition-shadow duration-300 relative flex flex-col justify-end items-center"
            >
              <img src={item.image} alt={item.name} className="w-2/3 h-auto mt-2" />
              
              <button className="absolute bottom-2 left-5 right-5 bg-[#b6e5b6] hover:bg-[#a8d8a8] rounded-lg px-3 py-1.5 flex items-center justify-center gap-2 shadow-md transition-colors duration-200 cursor-pointer">
                <img src={Checkmark} alt="Buy" className="w-5 h-5" />
                <span className="text-[#2d5016] font-semibold text-2xl">{item.price}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
