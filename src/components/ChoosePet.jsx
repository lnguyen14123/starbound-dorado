import React, { useState } from "react";

import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase"; // make sure this points to your Firebase config

import GrayCat1 from "../assets/gray_cat1.png"
import YellowDog1 from "../assets/yellow_dog1.png"
import Dresser1 from "../assets/items/dresser_1.png"
import Window1 from "../assets/items/window_1.png"
import PottedPlant1 from "../assets/items/pottedplant_1.png"

function ChoosePet({ tabs, currentTab, onTabClick, setIsNewUser}) {

    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);

    const handleChoosePet = async (petType) => {
      setSaving(true); // start loading

      try {
        const uid = localStorage.getItem("uid");

        if (!uid) {
          console.error("No UID found in localStorage");
          return;
        }
    
        const res = await fetch("/api/choosePet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uid: uid,
            petType: petType
          }),
        });

        localStorage.setItem("isNewUser", "false");
        setIsNewUser(false);
        navigate('/')

      } catch (err) {      
        console.log(err.message);
      }finally {
        setSaving(false); // stop loading
      }
    
    };
  
  return (

<div className="relative w-screen h-screen bg-transparent flex flex-col items-center justify-center z-30">

{/* Title */}
    <div className="bg-[#c49b80] z-10 px-20 h-15 w-auto border-[#b59179] border-3 rounded-3xl flex items-center justify-center">
      <h1 className="mt-2 text-6xl text-center font-bold font-dongle">
        Choose Your Starting Pet!
      </h1>
    </div>

        <img
          src={Dresser1} // e.g., rug, couch, or table
          alt="Platform"
          className="absolute left-2/3 bottom-2/10 w-[300px] h-auto z-5"
        />

        <img
          src={Window1} // e.g., rug, couch, or table
          alt="Platform"
          className="absolute left-5/7 bottom-5/10 w-[400px] h-auto z-0"
        />

        <img
          src={PottedPlant1} // e.g., rug, couch, or table
          alt="Platform"
          className="absolute left-6/7 bottom-96 w-[120px] h-auto z-0"
        />

    {/* Pet images container */}
    <div className="pl-40 flex justify-center items-center gap-30 bg-transparent pt-30 z-30">

        {/* Dog */}
        <div
        className="cursor-pointer transition-transform duration-300 hover:scale-105  rounded-3xl"
        onClick={() => handleChoosePet("dog")}
        >
        <img
            src={YellowDog1}
            alt="Dog"
            className="w-100 h-auto hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.9)]"
        />
        </div>

        {/* Cat */}
        <div
        className="cursor-pointer transition-transform duration-300 hover:scale-105 rounded-3xl"
        onClick={() => handleChoosePet("cat")}
        >
        <img
            src={GrayCat1}
            alt="Cat"
            className="w-130 h-auto  hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.9)]"
        />
        </div>

    </div>

</div>
);
}

export default ChoosePet;
