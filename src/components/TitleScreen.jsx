import React from "react";
import LogoWordmark from "../assets/icons/title.svg";
import TitleIcon from "../assets/icons/taskigotchi.svg";
import { useTheme } from "../context/ThemeContext";

const TitleScreen = ({ show, onDismiss }) => {
  if (!show) return null;

  const { theme = "light", toggleTheme = () => {} } = useTheme() || {};

  const handleDismiss = () => {
    if (typeof onDismiss === "function") {
      onDismiss();
    }
  };

  const preventPropagation = (event) => {
    event.stopPropagation();
  };

  const overlayGradient =
    theme === "dark"
      ? "from-[#05060d] via-[#12182a] to-[#05060d]"
      : "from-[#dbbba4] via-[#ffe9c9] to-[#dbbba4]";

  const cardBackground =
    theme === "dark"
      ? "bg-[#111631]/85 border-white/10 text-[#f4ede5]"
      : "bg-white/70 border-white/60 text-[#5f4637]";

  const accentColor = theme === "dark" ? "#f1d7bb" : "#a07a5f";
  const bodyColor = theme === "dark" ? "#f5ede1" : "#5f4637";

  return (
    <div
      className={`fixed inset-0 z-[120] flex items-center justify-center
      bg-gradient-to-b ${overlayGradient}
      title-screen-overlay px-4 py-4`}
    >
      <div className="title-screen-ambient" />
      <div
        className={`relative text-center space-y-5 sm:space-y-6 px-6 py-8 sm:px-10 sm:py-12
             rounded-[1.75rem] sm:rounded-[2.5rem]
             ${cardBackground} backdrop-blur-[18px]
             ${theme === "dark" ? "shadow-[0_25px_70px_rgba(3,4,10,0.85)]" : "shadow-[0_30px_80px_rgba(90,53,31,0.35)]"}
             w-full max-w-[640px]
             mx-auto flex flex-col items-center justify-center
             scale-[85%] sm:scale-80 md:scale-90 transition-transform duration-300`}
        onClick={preventPropagation}
      >
        <button
          onClick={(event) => {
            event.stopPropagation();
            toggleTheme();
          }}
          className="absolute top-4 right-4 flex items-center gap-2 rounded-full
                     bg-white/70 dark:bg-white/10 backdrop-blur-md
                     px-5 py-2 shadow-md text-base font-dongle text-[#5f4637] dark:text-white/90 cursor-pointer
                     hover:-translate-y-0.5 transition"
        >
          <span aria-hidden="true" className="text-lg font-semibold tracking-wide">
            {theme === "dark" ? "SUN" : "MOON"}
          </span>
          <span className="text-2xl">
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </span>
        </button>
        <p
          className="uppercase tracking-[0.2rem] font-dongle text-[#a07a5f]"
          style={{ fontSize: "clamp(1.25rem, 3vw, 2rem)", color: accentColor }}
        >
          Welcome to
        </p>
        <img
          src={TitleIcon}
          alt="Taskigotchi crest"
          className="mx-auto title-screen-heading drop-shadow-[5px_5px_4px_rgba(0,0,0,0.5)]"
          style={{
            width: "clamp(100px, 22vw, 180px)",
            marginBottom: "clamp(0.5rem, 2vw, 1.5rem)",
          }}
        />
        <img
          src={LogoWordmark}
          alt="Taskigotchi title"
          className="mx-auto title-screen-heading drop-shadow-[5px_5px_4px_rgba(0,0,0,0.5)]"
          style={{
            width: "clamp(235px, 58vw, 420px)",
            marginTop: "clamp(-0.4rem, -1vw, -0.2rem)",
            marginBottom: "clamp(0.75rem, 2.5vw, 2rem)",
          }}
        />
        <p
          className="font-dongle text-[#5f4637] leading-tight max-w-xl mx-auto"
          style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", color: bodyColor }}
        >
          Keep your cozy companion happy by conquering your to-do list.
        </p>
        <button
          onClick={handleDismiss}
          className="px-8 sm:px-12 py-3 rounded-full bg-[#e6cfb3]
                     text-[#7f5d34] font-dongle shadow-lg hover:shadow-xl cursor-pointer
                     transition-transform duration-200 hover:-translate-y-0.5"
          style={{ fontSize: "clamp(2rem, 2vw, 2rem)" }}
        >
          Click here to start
        </button>
      </div>
      <div className="title-screen-stars pointer-events-none" />
    </div>
  );
};

export default TitleScreen;

