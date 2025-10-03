import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import Notebook from "./Notebook";



export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.message);
    }
  };

  return (

    // <Notebook>

    //     {/* <div className="w-full h-full bg-black"></div> */}
    //     <div className="bg-[#cfab92] p-6 mt-13 h-15 w-90 border-[#c7a68e] border-3 rounded-3xl flex items-center justify-center">
    //         <h1 className="text-4xl text-center font-dynapuff">Welcome Back!</h1>
    //     </div>

    //     <div className="flex flex-col gap-4 w-80">
    //         <input
    //         type="text"
    //         placeholder="Username"
    //         className="p-3 rounded-2xl border-2 border-[#c7a68e] focus:outline-none focus:ring-2 focus:ring-[#c7a68e]"
    //         />
    //         <input
    //         type="password"
    //         placeholder="Password"
    //         className="p-3 rounded-2xl border-2 border-[#c7a68e] focus:outline-none focus:ring-2 focus:ring-[#c7a68e]"
    //         />
    //         <button className="mt-4 bg-[#c7a68e] text-white p-3 rounded-3xl hover:bg-[#b6917d] transition">
    //         Login
    //         </button>
    //     </div>
    // </Notebook>

    <Notebook>
        <div className="flex flex-col items-center gap-6">
            {/* Welcome box */}
            <div className="bg-[#cfab92] p-6 mt-13 h-15 w-90 border-[#c7a68e] border-3 rounded-3xl flex items-center justify-center">
            <h1 className="text-4xl text-center font-bold font-dynapuff">Welcome Back!</h1>
        </div>

            {/* Input fields */}
            <div className="flex flex-col gap-4 w-80 mt-20">
                <input
                type="text"
                placeholder="Username"
                className="bg-[#cfab92] text-[#8F674D] font-dongle font-black text-4xl pl-5 py-1 rounded-3xl border-2 border-[#c7a68e] focus:outline-none focus:ring-2 focus:ring-[#c7a68e]"
                />

                <input
                type="password"
                placeholder="Password"
                
                className="bg-[#cfab92] text-[#8F674D] font-bold font-dongle text-4xl pl-5 py-1 rounded-3xl border-2 border-[#c7a68e] focus:outline-none focus:ring-2 focus:ring-[#c7a68e]"
                />

                <button className="mt-40 bg-[#c7a68e] text-[#8F674D] p-3 rounded-3xl hover:bg-[#b6917d] transition">
                Login
                </button>
            </div>
        </div>
    </Notebook>

    
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
