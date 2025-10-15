import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import Notebook from "./Notebook";
import { useNavigate } from "react-router-dom";



export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();  // ✅ define navigate here


  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.message);
    }
  };
  return (

<div className="w-screen h-screen flex items-center justify-center relative">
  {/* Notebook wrapper to control centering */}
  <div className="relative w-auto">
    {/* Notebook itself */}
    <Notebook>
      <div className="flex flex-col items-center gap-0">
        {/* Welcome box */}
        <div className="bg-[#cfab92] p-6 mt-13 h-15 w-90 border-[#c7a68e] border-3 rounded-3xl flex items-center justify-center">
          <h1 className="text-4xl text-center font-bold font-dynapuff">Welcome Back!</h1>
        </div>

        <h1 className="text-4xl mt-1 text-[#AD7B5C] text-center font-bold font-dongle">
          Your PET is waiting!
        </h1>

        {/* Input fields */}
        <form className="flex flex-col gap-4 w-90 mt-13" onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-[#ebd3c3] text-[#8F674D] font-dongle font-bold text-4xl pl-5 py-2 rounded-3xl border-3 border-[#e2cec0] focus:outline-none focus:ring-2 focus:ring-[#c7a68e]"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}

            className="bg-[#ebd3c3] text-[#8F674D] font-bold font-dongle text-4xl pl-5 py-2 rounded-3xl border-3 border-[#e2cec0] focus:outline-none focus:ring-2 focus:ring-[#c7a68e]"
          />

          <p className="text-right">
            <button className="cursor-pointer text-[#c6ac99] font-dongle font-bold text-3xl">
              Forgot Password?
            </button>
          </p>

          <button className="mt-20 bg-[#AD7B5C] shadow-[0_5px_10px_rgba(0,0,0,0.7)] cursor-pointer text-white p-1 text-5xl font-dongle rounded-3xl font-bold hover:bg-[#b6917d] transition">
            Login
          </button>
        </form>


      </div>
    </Notebook>

    {/* Side buttons, glued to the Notebook */}
    <div className="absolute top-20 right-78 flex flex-col gap-4 z-0">
      <button className="text-right cursor-pointer bg-[#ffbac4] text-4xl font-dongle 
      font-bold text-white pl-6 border-[#fe8693] border-3 pr-3 py-1 rounded-r-sm shadow-md hover:bg-[#fe8693] transition"
      onClick={() => navigate("/login")}>
        Login
      </button>

      <button className="text-right cursor-pointer bg-[#ffbac4] text-4xl -translate-x-4 
      font-bold font-dongle text-white pl-10 pr-3 py-1 border-[#fe8693] border-3 rounded-r-sm shadow-md hover:bg-[#fe8693] transition"
      onClick={() => navigate("/register")}>
        Sign Up
      </button>
    </div>
  </div>
</div>
  );

}