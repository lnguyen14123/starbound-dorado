// MainPage.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Floor from "./Floor";
import GrayCat1 from "../assets/gray_cat1.png";
import YellowDog1 from "../assets/yellow_dog1.png";

export default function MainPage() {
  const [petType, setPetType] = useState(null);

  useEffect(() => {
    const cachedPet = localStorage.getItem("petType");
    if (cachedPet) setPetType(cachedPet);

    const fetchPet = async () => {
      try {
        const uid = localStorage.getItem("uid");
        const response = await fetch("/api/user/pet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid }),
        });
      
        const data = await response.json();
        setPetType(data.petType);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPet();
  }, []);

  const getPetImage = () => {
    if (petType === "cat") return GrayCat1;
    if (petType === "dog") return YellowDog1;
    return null;
  };

  return (
    <div className="grid grid-cols-[80px_1fr] h-screen w-screen bg-[#dbb9a0] relative">
      <Sidebar />
      <div className="relative flex justify-center">
        <Floor />
        {petType && (
          <img
            src={getPetImage()}
            alt={petType}
            className={`absolute z-20  h-auto animate-bounce-slow ${
                petType === "cat" ? " top-[40vh] w-[35vw]" : petType === "dog" ? "top-[38vh] w-[25vw]" : ""
              }`}
                      />
        )}
      </div>
    </div>
  );
}
