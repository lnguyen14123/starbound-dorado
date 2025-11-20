import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import Notebook from "./Notebook";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

const friendlyErrorMessages = {
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/invalid-credential": "Your password or username is incorrect.",
  "auth/user-not-found": "No account found with this email.",
  "auth/wrong-password": "Incorrect password. Please try again.",
};


const handleLogin = async (e) => {
  e.preventDefault();
  if (isSubmitting) return;
  setIsSubmitting(true);

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    localStorage.setItem("uid", user.uid);

    await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid: user.uid,
        email: user.email,
        username: user.email?.split("@")[0] || "User",
      }),
    });

    navigate("/", { state: { showLoading: true } });
  } catch (err) {
    const message = friendlyErrorMessages[err.code] || "Something went wrong, please try again.";
    setError(message);
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="w-screen h-screen flex items-center justify-center relative z-30">
      {/* Notebook wrapper */}
      <div className="relative flex justify-center w-full max-w-[1200px]">
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
            <form className="flex flex-col gap-[2vh] w-[50vh] mt-13" onSubmit={handleLogin}>
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
                <button
                  type="button"
                  className="cursor-pointer text-[#c6ac99] font-dongle font-bold text-3xl underline"
                  onClick={() => navigate("/forgot-password")}
                >
                  Forgot Password?
                </button>
              </p>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-7 bg-[#AD7B5C] shadow-[0_5px_10px_rgba(0,0,0,0.7)] cursor-pointer text-white 
                  p-1 pt-2 text-5xl font-dongle rounded-3xl font-bold hover:bg-[#b6917d] transition 
                  disabled:opacity-70 disabled:cursor-not-allowed"
              >
                Login
              </button>

              <p className="text-center text-3xl font-dongle font-bold text-[#c6ac99] mt-4">
                Don't have an account?{" "}
                <button
                  type="button"
                  className="cursor-pointer underline"
                  onClick={() => navigate("/register")}
                >
                  Sign Up
                </button>
              </p>
            </form>
          </div>
        </Notebook>
      </div>

      {/* Error modal */}
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
              className="mt-6 bg-[#AD7B5C] text-white text-4xl font-dongle font-bold px-8 py-2 rounded-3xl hover:bg-[#b6917d] transition cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
