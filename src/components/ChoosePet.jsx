import React from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase"; // make sure this points to your Firebase config

function ChoosePet({ tabs, currentTab, onTabClick }) {

    const navigate = useNavigate();
  
  return (

    <div className="relative w-70 h-screen bg-transparent flex items-center justify-start">

        HELLO


    </div>
  );
}

export default ChoosePet;
