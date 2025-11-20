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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const [justRegistered, setJustRegistered] = useState(false);

  const friendlyErrorMessages = {
    "auth/email-already-in-use": "That email already has an account.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/weak-password": "Password must be at least 6 characters.",
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!userName.trim() || !email.trim()) {
      setError("Username and email are required.");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          username: userName,
        }),
      });
      
      localStorage.setItem("isNewUser", "true");
      localStorage.setItem("uid", user.uid);
      setJustRegistered(true);
      navigate("/ChoosePet", { replace: true });
    } catch (err) {
      const message = friendlyErrorMessages[err.code] || "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center relative z-50">
      {/* Notebook wrapper */}
<div className="relative flex justify-center items-start w-full max-w-[1200px]">
        {/* Notebook */}
        <Notebook>
          <div className="flex flex-col items-center gap-0">
            {/* Welcome box */}
            <div className="bg-[#cfab92] p-6 mt-13 h-15 w-90 border-[#c7a68e] border-3 rounded-3xl flex items-center justify-center">
              <h1 className="text-4xl text-center font-bold font-dynapuff">Welcome</h1>
            </div>

            {/* Input fields */}
            <form className="flex flex-col gap-[2vh] w-[50vh] mt-13" onSubmit={handleRegister}>
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
                type="submit" 
                disabled={isSubmitting}
                className="mt-7 bg-[#AD7B5C] shadow-[0_5px_10px_rgba(0,0,0,0.7)] cursor-pointer text-white 
                p-1 pt-2 text-5xl font-dongle rounded-3xl font-bold hover:bg-[#b6917d] transition disabled:opacity-70 disabled:cursor-not-allowed"
              >
                Create New Account
              </button>

              <p className="text-center text-3xl font-dongle font-bold text-[#c6ac99]">
                Already Have an Account?{" "}
                <button
                  type="button"
                  className="cursor-pointer underline"
                  onClick={() => navigate("/login")}
                >
                  Log in
                </button>
              </p>
            </form>
          </div>
        </Notebook>

  {/* Side buttons, sticking out from notebook
  <div className="absolute top-1/6 right-50 flex flex-col gap-4">
    <button
      className="text-right cursor-pointer bg-[#ffbac4] text-4xl font-dongle font-bold text-white pl-6 border-[#fe8693] border-3 pr-3 py-1 rounded-r-sm shadow-md hover:bg-[#fe8693] transition"
      onClick={() => navigate("/login")}
    >
      Login
    </button>

    <button
      className="text-right cursor-pointer bg-[#ffbac4] text-4xl font-bold font-dongle text-white pl-10 pr-3 py-1 border-[#fe8693] border-3 rounded-r-sm shadow-md hover:bg-[#fe8693] transition"
      onClick={() => navigate("/register")}
    >
      Sign Up
    </button>
  </div> */}


      </div>

      {error && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/50 z-[100]"
          role="alertdialog"
          aria-live="assertive"
          aria-modal="true"
        >
          <div className="bg-[#ebd3c3] border-4 border-[#c7a68e] rounded-3xl px-10 py-8 text-center shadow-2xl max-w-md">
            <p className="text-4xl font-dongle font-bold text-[#8F674D]">{error}</p>
            <button
              type="button"
              onClick={() => setError("")}
              className="mt-6 bg-[#AD7B5C] text-white text-4xl font-dongle font-bold px-8 py-2 rounded-3xl hover:bg-[#b6917d] transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
