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
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Store Firebase auth uid in localStorage
      localStorage.setItem("uid", user.uid);
      
      // Ensure user exists in database (create or update)
      try {
        await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uid: user.uid,
            email: user.email,
            username: user.email?.split("@")[0] || "User", // Use email prefix as default username
          }),
        });
      } catch (dbErr) {
        console.error("Error creating/updating user in database:", dbErr);
        // Continue anyway - user can still log in
      }
      
      // Navigate to home page after successful login
      // After successful login
      navigate("/", { state: { showLoading: true } });
    } catch (err) {
      setError(err.message);
    }
  };
  return (

<div className="w-screen h-screen flex items-center justify-center relative z-30">
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
  </div>
</div>
  );

}