import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";

import { auth } from "../firebase";
import Notebook from "./Notebook";
import { useNavigate } from "react-router-dom";



export default function Register() {
  const [email, setEmail] = useState("");
  const [userName, setUser] = useState("");  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();  // ✅ define navigate here


  const handleRegister = async (e) => {
    e.preventDefault();
    console.log(email);
    console.log(password);

    console.log("HELLO");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    

    try {

      console.log(email);
      console.log(password);


      await createUserWithEmailAndPassword(auth, email, password);
      alert("Registration successful!");
      // redirect to login or dashboard
    } catch (err) {
      console.log(email);
      console.log(password);
  
      console.log("HELLO");
  
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
          <h1 className="text-4xl text-center font-bold font-dynapuff">Welcome</h1>
        </div>

        {/* Input fields */}
        <form className="flex flex-col gap-4 w-90 mt-13" onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Username"
            value={userName}
            onChange={(e) => setUser(e.target.value)}
            className="bg-[#ebd3c3] text-[#8F674D] font-dongle font-bold text-4xl pl-5 py-2 rounded-3xl border-3 border-[#e2cec0] focus:outline-none focus:ring-2 focus:ring-[#c7a68e]"
          />

          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-[#ebd3c3] text-[#8F674D] font-bold font-dongle text-4xl pl-5 py-2 rounded-3xl border-3 border-[#e2cec0] focus:outline-none focus:ring-2 focus:ring-[#c7a68e]"
          />

        <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a Password"
            className="bg-[#ebd3c3] text-[#8F674D] font-bold font-dongle text-4xl pl-5 py-2 rounded-3xl border-3 border-[#e2cec0] focus:outline-none focus:ring-2 focus:ring-[#c7a68e]"
          />


          <input
            type="password"
            placeholder="Confirm Your Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="bg-[#ebd3c3] text-[#8F674D] font-bold font-dongle text-4xl pl-5 py-2 rounded-3xl border-3 border-[#e2cec0] focus:outline-none focus:ring-2 focus:ring-[#c7a68e]"
          />

          <button 
          // type="submit" 
          className="mt-7 bg-[#AD7B5C] shadow-[0_5px_10px_rgba(0,0,0,0.7)] cursor-pointer text-white 
          p-1 pt-2 text-5xl font-dongle rounded-3xl font-bold hover:bg-[#b6917d] transition"
          onClick={handleRegister}
          >
            Create New Account
          </button>

          <p className="text-center text-3xl font-dongle font-bold text-[#c6ac99]">
            Already Have an Account?{" "}
            <button className="cursor-pointer underline" onClick={() => navigate("/login")}>Log in</button>
          </p>

          <div>
            <button onClick={() => console.log("CLICK")}>Test Click</button>
          </div>


        </form>
      </div>
    </Notebook>

    {/* Side buttons, glued to the Notebook */}
    <div className="absolute top-20 right-78 flex flex-col gap-4 z-0">
      <button className="text-right cursor-pointer bg-[#ffbac4] text-4xl font-dongle -translate-x-4 
      font-bold text-white pl-6 border-[#fe8693] border-3 pr-3 py-1 rounded-r-sm shadow-md hover:bg-[#fe8693] transition"
      onClick={() => navigate("/login")}>
        Login
      </button>

      <button className="text-right cursor-pointer bg-[#ffbac4] text-4xl 
      font-bold font-dongle text-white pl-10 pr-3 py-1 border-[#fe8693] border-3 rounded-r-sm shadow-md hover:bg-[#fe8693] transition"
      onClick={() => navigate("/register")}>
        Sign Up
      </button>
    </div>
  </div>
</div>

  );

//   return (
//     <form onSubmit={handleLogin} className="flex flex-col gap-4 p-6 bg-white rounded-lg shadow-md max-w-sm mx-auto">
//       <h2 className="text-xl font-bold text-center">Login</h2>
//       <input
//         type="email"
//         placeholder="Email"
//         value={email}
//         onChange={(e) => setEmail(e.target.value)}
//         className="p-2 border rounded"
//       />
//       <input
//         type="password"
//         placeholder="Password"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//         className="p-2 border rounded"
//       />
//       <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition">
//         Login
//       </button>
//       {error && <p className="text-red-500 text-sm">{error}</p>}
//     </form>
//   );
}
